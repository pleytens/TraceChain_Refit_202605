using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Traceverified.TraceFarm.Stograges;
using Volo.Abp.Application.Services;
using Volo.Abp.Content;

namespace Traceverified.TraceFarm.FileManagement;

public interface IStorageAppService : IApplicationService
{
    string UploadFile(IRemoteStreamContent file);
    IRemoteStreamContent DownloadFile(string fileName);
    string GetFileUrl(string fileName);
    string GetBase64Image(string fileName);
    Task<List<string>> GetListImageUrlAsync(int relatedEntityType, Guid relatedEntityId);
    Task<List<string>> GetListImageBase64Async(int relatedEntityType, Guid relatedEntityId);
    Guid?  UploadFileWithSave(IRemoteStreamContent file);
    Task<List<FileInfoDto>> GetFilesByNameAsync(string input);
    Task<List<FileInfoDto>> GetFilesByIdAsync(string input);
    
}