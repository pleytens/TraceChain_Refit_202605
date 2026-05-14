using System.Collections.Generic;
using System.Threading.Tasks;
using Traceverified.TraceFarm.TraceabilityRecords.Reports;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace Traceverified.TraceFarm.TraceabilityRecordsV2;

public interface IReportAppService : IApplicationService
{
    /// <summary>
    ///     Get map information in report form
    /// </summary>
    /// <param name="traceCode">(GS1)-(serial number)</param>
    /// <param name="userType"></param>
    /// <returns></returns>
    Task<ListResultDto<MapInfoReportV2>> GetReportMapInfo(string traceCode, int userType = 10);

    /// <summary>
    ///     Get map information in report form
    /// </summary>
    /// <param name="lotId"></param>
    /// <param name="gtinCode">(GS1)-(serial number)</param>
    /// <param name="userType"></param>
    /// <returns></returns>
    Task<ListResultDto<MapInfoReportV2>> GetReportMapInfoForProduct(string lotId, string gtinCode, int userType = 10);

    /// <summary>
    ///     Get product information in report form
    /// </summary>
    /// <param name="traceCode">(GS1)-(serial number)</param>
    /// <returns></returns>
    Task<ProductReportDto> GetReportProduct(string traceCode);
    
    /// <summary>
    ///     Get product information in report form
    ///     Using for export pdf file
    /// </summary>
    /// <param name="traceCode">(GS1)-(serial number)</param>
    /// <returns></returns>
    Task<ProductReportForExportDto> GetReportProductForExport(string traceCode);
    
    /// <summary>
    ///     Get product information in report form
    /// </summary>
    /// <param name="gtinCode">Product gtin code</param>
    /// <param name="lotId"></param>
    /// <returns></returns>
    Task<ProductReportDto> GetReportProductForPro(string gtinCode, string? lotId = null);

    /// <summary>
    ///     Get company information in report form
    /// </summary>
    /// <param name="traceCode">(GS1)-(serial number)</param>
    /// <returns></returns>
    Task<CompanyReportDto> GetReportCompany(string traceCode);

    /// <summary>
    ///     Get company information in report form
    /// </summary>
    /// <param name="gtinCode">Product gtin code</param>
    /// <param name="lotId"></param>
    /// <returns></returns>
    Task<CompanyReportDto> GetReportCompanyForProduct(string gtinCode, string? lotId = null);

    /// <summary>
    ///     Get diary information in report form
    /// </summary>
    /// <param name="traceCode">(GS1)-(serial number)</param>
    /// <param name="userType"></param>
    /// <returns></returns>
    Task<DiaryReportV2Dto> GetReportDiary(string traceCode, int userType = 10);
    Task<DiaryReportV2Dto> GetReportDiary(string traceCode,string? lotId = null, int userType = 10);

    /// <summary>
    ///     Check if the user is allowed to see the combo box of user type
    /// </summary>
    /// <param name="traceCode"></param>
    /// <returns>bool</returns>
    Task<bool> ShowUserType(string traceCode);

    /// <summary>
    ///     This method using for Free version
    /// </summary>
    /// <param name="gtinCode"></param>
    /// <param name="lotId"></param>
    /// <returns></returns>
    Task<ProductReportDto> GetReportProductForFree(string gtinCode);

    /// <summary>
    ///  This method using for Free version
    /// </summary>
    /// <param name="gtinCode"></param>
    /// <returns></returns>
    Task<CompanyReportDto> GetReportCompanyForFree(string gtinCode);

    /// <summary>
    ///  This method using for number of companies
    /// </summary>
    /// <param name="year"></param>
    /// <returns></returns>
    Task<IList<int>> GetNumberOfCompaniesJoin(int? year);

    /// <summary>
    /// This method using for get company information in report form
    /// </summary>
    /// <param name="traceCode"></param>
    /// <param name="userType"></param>
    /// <returns></returns>
    Task<ListResultDto<CompanyCardInfoDto>> GetReportCompanyInfo(string traceCode, int userType = 10);

    /// <summary>
    /// This api using for get diary information in report form by traceability code
    /// </summary>
    /// <param name="traceCode"></param>
    /// <param name="userType"></param>
    /// <returns></returns>
    Task<DiaryReportV2Dto> GetReportDiaryByTraceabilityCode(string traceCode, int userType = 10);
}