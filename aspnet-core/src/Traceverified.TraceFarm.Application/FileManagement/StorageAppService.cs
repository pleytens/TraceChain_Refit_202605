using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Traceverified.TraceFarm.Stograges;
using Traceverified.TraceFarm.Storages;
using Volo.Abp.Application.Services;
using Volo.Abp.Content;
using Volo.Abp.Data;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.MultiTenancy;

namespace Traceverified.TraceFarm.FileManagement;

public class StorageAppService(
    IHostingEnvironment webHostEnvironment,
    IConfiguration configuration,
    IHttpContextAccessor httpContextAccessor,
    IDataFilter dataFilter,
    IRepository<ImageStorage, Guid> imageRepository)
    : ApplicationService, IStorageAppService
{
    public string UploadFile(IRemoteStreamContent file)
    {
        // var generatedFileName = file.FileName;
        var rootPath = webHostEnvironment.ContentRootPath;
        var uploadPath = configuration["FileStorage:RootPath"];
        var fs = file.GetStream();
        var filePath = rootPath + uploadPath + file.FileName;
        using var stream = new FileStream(filePath, FileMode.Create);
        fs.CopyTo(stream);
        return file.FileName??"";
    }
    
    public Guid? UploadFileWithSave(IRemoteStreamContent file)
    {
        if (file.FileName == null)
        {
            return null;
        }

        var generatedFileName = GenerateFileName(file.FileName);
        var rootPath = webHostEnvironment.ContentRootPath;
        var uploadPath = configuration["FileStorage:RootPath"];
        var fs = file.GetStream();
        var filePath = rootPath + uploadPath + generatedFileName;
        using var stream = new FileStream(filePath, FileMode.Create);
        fs.CopyTo(stream);

        var fileInput = imageRepository.InsertAsync(new ImageStorage
        {
            RelatedEntityId = Guid.Empty,
            RelatedEntityType = (int)ImageStorageEnum.ProductFile,
            ImageName = generatedFileName,
            ImageNameRaw = file.FileName,
            TenantId = CurrentTenant.Id,
            Status = (int)ImageStorageStatusEnum.Draft
        },true).Result;
        return fileInput.Id;
    }

    public async Task<List<FileInfoDto>> GetFilesByNameAsync(string input)
    {
        using (dataFilter.Disable<IMultiTenant>())
        {
            var nameLst = input.Split(',');
            if (nameLst.Length == 0)
            {
                return [];
            }

            var imageStorageQuery = await imageRepository.GetQueryableAsync();
            var files = imageStorageQuery.Where(n => nameLst.Contains(n.ImageName)).Select(n => new FileInfoDto()
            {
                FileId =  n.Id,
                FileName =  n.ImageName,
            }).ToList();

            foreach (var file in files)
            {
                file.Url = GetFileUrl(file.FileName);
            }
            return files;
        }
    }

    public async Task<List<FileInfoDto>> GetFilesByIdAsync(string input)
    {
        try
        {
            using (dataFilter.Disable<IMultiTenant>())
            {
                var idLst = input.Split(',');
                if (idLst.Length == 0)
                {
                    return [];
                }
                var guids = idLst
                    .Select(Guid.Parse)
                    .ToList();
                var imageStorageQuery = await imageRepository.GetQueryableAsync();
                var files = imageStorageQuery.Where(n => guids.Contains(n.Id)).Select(n => new FileInfoDto()
                {
                    FileId =  n.Id,
                    FileName =  n.ImageName,
                    FileNameRaw = n.ImageNameRaw??"",
                }).ToList();

                foreach (var file in files)
                {
                    file.Url = GetFileUrl(file.FileName);
                }
                return files;
            }
        }
        catch (Exception e)
        {
            Logger.Log( LogLevel.Error, e.Message);
            return [];
        }
    }
    
    public IRemoteStreamContent DownloadFile(string fileName)
    {
        var rootPath = webHostEnvironment.ContentRootPath;
        var uploadPath = configuration["FileStorage:RootPath"];
        var fs = new FileStream(rootPath + uploadPath + fileName, FileMode.Open, FileAccess.Read);
        return new RemoteStreamContent(fs);
    }

    public string GetFileUrl(string fileName)
    {
        // Retrieve the current HttpContext
        var httpContext = httpContextAccessor.HttpContext;

        // Get the host information (domain and port)
        var host = httpContext.Request.Host.Value;

        var showPath = configuration["FileStorage:ShowPath"];
        var uploadPath = configuration["FileStorage:RootPath"];
        var fullPath = "https://" + host + showPath + fileName;

        // Check if the file exists
        var rootPath = webHostEnvironment.ContentRootPath;
        var filePath = rootPath + uploadPath + fileName;
        if (File.Exists(filePath))
        {
            return fullPath;
        }

        // If the file doesn't exist, set a default filename
        fileName = "default.png";
        fullPath = "https://" + host + showPath + fileName;

        return fullPath;
    }

    public string GetBase64Image(string fileName)
    {
        var rootPath = webHostEnvironment.ContentRootPath;
        var uploadPath = configuration["FileStorage:RootPath"];
        var filePath = rootPath + uploadPath + fileName;
        if (File.Exists(filePath))
        {
            var imageArray = File.ReadAllBytes(rootPath + uploadPath + fileName);
            var base64ImageRepresentation = Convert.ToBase64String(imageArray);
            return "data:image/jpg;base64," + base64ImageRepresentation;
        }

        var imageDefaultArray = File.ReadAllBytes(rootPath + uploadPath + "default.png");
        var base64ImageRepresentationDefault = Convert.ToBase64String(imageDefaultArray);
        return "data:image/jpg;base64," + base64ImageRepresentationDefault;
    }

    public async Task<List<string>> GetListImageUrlAsync(int relatedEntityType, Guid relatedEntityId)
    {
        using (dataFilter.Disable<IMultiTenant>())
        {
              var images = await imageRepository.GetListAsync(n =>
                        n.RelatedEntityId == relatedEntityId && n.RelatedEntityType == relatedEntityType);
                    return images.Select(image => GetBase64Image(image.ImageName)).ToList();
        }
    }
    
    public async Task<List<string>> GetListImageBase64Async(int relatedEntityType, Guid relatedEntityId)
    {
        using (dataFilter.Disable<IMultiTenant>())
        {
            var images = await imageRepository.GetListAsync(n =>
                n.RelatedEntityId == relatedEntityId && n.RelatedEntityType == relatedEntityType);
            return images.Select(image => GetBase64Image(image.ImageName)).ToList();
        }
    }
    
    private static string GenerateFileName(string originalFileName)
    {
        var extension = Path.GetExtension(originalFileName);
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds().ToString();
        return string.IsNullOrWhiteSpace(extension) ? timestamp : timestamp + extension;
    }
}
