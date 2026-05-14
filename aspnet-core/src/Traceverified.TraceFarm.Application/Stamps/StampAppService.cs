using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Threading.Tasks;
using NPOI.SS.UserModel;
using NPOI.XSSF.UserModel;
using Traceverified.TraceFarm.Companies;
using Traceverified.TraceFarm.EnumTranslations;
using Traceverified.TraceFarm.Permissions;
using Traceverified.TraceFarm.TraceabilityRecordsV2;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Data;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.MultiTenancy;

namespace Traceverified.TraceFarm.Stamps;

public class StampAppService : CrudAppService<
        Stamp, //The Market entity
        StampDto, //Used to show markets
        Guid, //Primary key of the market entity
        PagedAndSortedResultRequestDto, //Used for paging/sorting
        CreateUpdateStampDto>, //Used to create/update a market, 
    IStampAppService
{
    private readonly IRepository<Company, Guid> _companyRepository;
    private readonly IRepository<Stamp, Guid> _stampRepository;
    private readonly IRepository<RecordShare, Guid> _recordShareRepository;
    private readonly IRepository<EnumTranslation, Guid> _enumTranslationRepository;
    private readonly IDataFilter _dataFilter;

    public StampAppService(IRepository<Stamp, Guid> repository, IRepository<Company, Guid> companyRepository, IRepository<RecordShare, Guid> recordShareRepository, IDataFilter dataFilter, IRepository<EnumTranslation, Guid> enumTranslationRepository) :
        base(repository)
    {
        _stampRepository = repository;
        _companyRepository = companyRepository;
        _recordShareRepository = recordShareRepository;
        _dataFilter = dataFilter;
        _enumTranslationRepository = enumTranslationRepository;
        GetPolicyName = TraceFarmPermissions.Stamps.Default;
        GetListPolicyName = TraceFarmPermissions.Stamps.Default;
        CreatePolicyName = TraceFarmPermissions.Stamps.Create;
        UpdatePolicyName = TraceFarmPermissions.Stamps.Edit;
        DeletePolicyName = TraceFarmPermissions.Stamps.Delete;
    }

    public async Task<PagedResultDto<StampDto>> GetListCustomAsync(StampFilterDto filter)
    {
        var query = await _stampRepository.GetQueryableAsync();
        var enumQuery = await _enumTranslationRepository.GetQueryableAsync();
        var queryFilter = query
            .WhereIf(filter.CompanyIds.Count > 0, n => filter.CompanyIds.Contains(n.CompanyId))
            .WhereIf(filter.FromDate.HasValue, n => filter.FromDate != null && n.CreationTime.Date >= filter.FromDate.Value.Date)
            .WhereIf(filter.ToDate.HasValue, n => filter.ToDate != null && n.CreationTime.Date <= filter.ToDate.Value.Date);
        var cultureInfo = CultureInfo.CurrentUICulture;

        var result = queryFilter.OrderBy(filter.Sorting ?? "CreationTime desc").Skip(filter.SkipCount)
            .Take(filter.MaxResultCount)
            .Select(n => new StampDto
            {
                Id = n.Id,
                CompanyName = "", // todo: get value from company
                CompanyId = n.CompanyId,
                CreatedDate = n.CreationTime,
                EndLotNumber = n.EndLotNumber,
                Quantity = n.Quantity,
                StartLotNumber = n.StartLotNumber,
                Note = n.Note,
                Status = n.Status,
                StatusText = enumQuery.Any(g=>g.EnumType == nameof(StampStatusEnum) && cultureInfo.Name == g.Language && g.EnumKey == n.Status) 
                    ? enumQuery.FirstOrDefault(g=> g.EnumType == nameof(StampStatusEnum) && cultureInfo.Name == g.Language && g.EnumKey == n.Status)!.EnumValue : nameof(StampStatusEnum.Ready)
            }).ToList();
        foreach (var item in result)
        {
            var companyQuery = await _companyRepository.GetQueryableAsync();
            var company = companyQuery.FirstOrDefault(n => n.Id == item.CompanyId);
            if (company != null)
            {
                item.CompanyName = company.Name;
            }
        }

        return new PagedResultDto<StampDto>(queryFilter.Count(), result);
    }
    
    public async Task<StartAndEndGenerateDto> GenerateStampNumberAsync(int numberOfStamps, Guid companyId)
    {
        using (_dataFilter.Disable<IMultiTenant>())
        {
            var company = await _companyRepository.GetAsync(companyId);
            if (company == null)
            {
                throw new UserFriendlyException("Company not found");
            }
            var endNumber = (await _stampRepository.GetQueryableAsync()).Where(n => n.CompanyId == companyId);
            if (!endNumber.Any())
            {
                return new StartAndEndGenerateDto
                {
                    StartNumber = 1,
                    EndNumber = numberOfStamps
                };
            }

            var startNumber = endNumber.Max(n => n.EndLotNumber) + 1;
            var endNumberResult = startNumber + numberOfStamps - 1;
            return new StartAndEndGenerateDto
            {
                StartNumber = startNumber,
                EndNumber = endNumberResult
            };
        }
    }

    private async Task<List<StampExportDto>> PrintDataAsync(Guid stampId, string clientUrl)
    {
        try
        {
            var stampObj = await _stampRepository.FirstOrDefaultAsync(n=>n.Id == stampId);
            if(stampObj == null)
            {
                throw new UserFriendlyException("Stamp not found");
            }
            var company = await _companyRepository.GetAsync(stampObj.CompanyId);
            if(company == null)
            {
                throw new UserFriendlyException("Company not found");
            }
            var result = new List<StampExportDto>();
            for (var i = stampObj.StartLotNumber; i <= stampObj.EndLotNumber; i++)
            {
                result.Add(new StampExportDto
                {
                    CompanyName = company.Name,
                    QRCode = $"{company.GS1Code}-{i}",
                    CreatedDate = stampObj.CreationTime.ToString("dd/MM/yyyy"),
                    Note = stampObj.Note,
                    TraceUrl = $"{clientUrl}/t?d={company.GS1Code}-{i}",
                });
            }
            return result;
        }
        catch (Exception e)
        {
            throw new UserFriendlyException(e.Message);
        }
    }
    public async Task<StampExportResponseDto> GetExcelFileAsync(Guid stampId,string clientUrl)
    {
        var fileNameReturn = $"Stamp_{DateTime.Now:yyyyMMddHHmmss}.xlsx";

        var list = await PrintDataAsync(stampId,clientUrl);
        if (list.Count == 0)
        {
            // throw new UserFriendlyException("null data at here");
            return new StampExportResponseDto(fileNameReturn, null);
        }
        
        var stampObj= await _stampRepository.FirstOrDefaultAsync(n=>n.Id == stampId);
        if(stampObj != null)
        {
            stampObj.Status = (int)StampStatusEnum.Printed;
            await _stampRepository.UpdateAsync(stampObj);
        }
        
        var templatePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "templates", "StampTemplate.xlsx");
        
        var directoryExportPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "exports");
        if (!Directory.Exists(directoryExportPath))
        {
            Directory.CreateDirectory(directoryExportPath);
        }
        var fileExportPath = Path.Combine(directoryExportPath, fileNameReturn);
        
        File.Copy(templatePath, fileExportPath, true);
        IWorkbook templateWorkbook;
        await using (var fs = new FileStream(fileExportPath, FileMode.Open, FileAccess.Read))
        {
            templateWorkbook = new XSSFWorkbook(fs);
        }

        var rowIndex = 4;
        const string sheetName = "QRCode";
        var sheet = templateWorkbook.GetSheet(sheetName) ?? templateWorkbook.CreateSheet(sheetName);
        foreach (var item in list)
        {
            var row = sheet.GetRow(rowIndex) ?? sheet.CreateRow(rowIndex);
            row.CreateCell(0).SetCellValue(rowIndex - 3);
            row.CreateCell(1).SetCellValue(item.CreatedDate);
            row.CreateCell(2).SetCellValue(item.QRCode);
            row.CreateCell(3).SetCellValue(item.TraceUrl);
            row.CreateCell(4).SetCellValue(item.Note);
            rowIndex++;
        }

        await using (var fs = new FileStream(fileExportPath, FileMode.Create, FileAccess.Write))
        {
            templateWorkbook.Write(fs);
        }
        var memory = new MemoryStream();
        await using (var stream = new FileStream(fileExportPath, FileMode.Open))
        {
            await stream.CopyToAsync(memory);
        }
        memory.Position = 0;
        return new StampExportResponseDto(fileNameReturn, memory.ToArray());
    }
}