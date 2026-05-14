using AutoMapper;
using Traceverified.TraceFarm.Companies;
using Traceverified.TraceFarm.ConfirmationTokens;
using Traceverified.TraceFarm.EnumTranslations;
using Traceverified.TraceFarm.Events;
using Traceverified.TraceFarm.GenerateQRCodeManagement;
using Traceverified.TraceFarm.Markets;
using Traceverified.TraceFarm.Partners;
using Traceverified.TraceFarm.ProcessManagements;
using Traceverified.TraceFarm.ProductCategories;
using Traceverified.TraceFarm.ProductManagements;
using Traceverified.TraceFarm.ReportTemplates;
using Traceverified.TraceFarm.Stamps;
using Traceverified.TraceFarm.SupplierManagements;
using Traceverified.TraceFarm.TraceabilityRecords;
using Receptacle = Traceverified.TraceFarm.Companies.Receptacle;

namespace Traceverified.TraceFarm;

public class TraceFarmApplicationAutoMapperProfile : Profile
{
    public TraceFarmApplicationAutoMapperProfile()
    {
        /* You can configure your AutoMapper mapping configuration here.
         * Alternatively, you can split your mapping configurations
         * into multiple profile classes for a better organization. */

        CreateMap<Event, EventDto>();
        CreateMap<EventDto, Event>();
        CreateMap<Market, MarketDto>();
        CreateMap<CreateUpdateMarketDto, Market>();
        CreateMap<ProductCategory, ProductCategoryDto>();
        CreateMap<CreateUpdateProductCategoryDto, ProductCategory>();
        CreateMap<Stamp, StampDto>();
        CreateMap<CreateUpdateStampDto, Stamp>();
        CreateMap<Company, CompanyDto>();
        CreateMap<CompanyDto, Company>();
        CreateMap<Company, CompanyForQrCodeDto>();
        CreateMap<CreateUpdateCompanyDto, Company>();
        CreateMap<Partner, PartnerDto>();
        CreateMap<CreateUpdatePartnerDto, Partner>();
        CreateMap<CompanyProfile, CompanyProfileDto>();
        CreateMap<CreateUpdateCompanyProfileDto, CompanyProfile>();
        CreateMap<Product, ProductDto>();
        CreateMap<CreateUpdateProductDto, Product>();
        CreateMap<CreateUpdateProductForGenQrDto, Product>();
        CreateMap<Process, ProcessDto>();
        CreateMap<CreateUpdateProcessDto, Process>();
        CreateMap<Supplier, SupplierDto>();
        CreateMap<CreateUpdateSupplierDto, Supplier>();

        CreateMap<ProcessStep, ProcessStepDto>();
        CreateMap<CreateUpdateProcessStepDto, ProcessStep>();
        CreateMap<ProcessField, ProcessFieldDto>();
        CreateMap<CreateUpdateFieldOptionDto, ProcessField>();

        CreateMap<Receptacle, ReceptacleDto>();
        CreateMap<CreateUpdateReceptacleDto, Receptacle>();

        CreateMap<TraceabilityRecord, TraceabilityRecordDto>();
        CreateMap<CreateUpdateTraceabilityRecordDto, TraceabilityRecord>();

        CreateMap<RecordReception, RecordReceptionDto>();
        CreateMap<CreateUpdateRecordReceptionDto, RecordReception>();

        CreateMap<TraceabilityRecordShare, TraceabilityRecordShareDto>();
        CreateMap<CreateUpdateRecordShareDto, TraceabilityRecordShare>();

        CreateMap<ReportTemplate, ReportTemplateDto>();
        CreateMap<CreateUpdateReportTemplateDto, ReportTemplate>();

        CreateMap<EnumTranslation, EnumTranslationDto>();
        CreateMap<CreateUpdateEnumTranslationDto, EnumTranslation>();

        CreateMap<CreateUpdateCompanyDto, CreateUpdatePartnerDto>();
        CreateMap<CreateUpdatePartnerDto, CreateUpdateCompanyDto>();

        CreateMap<GenerateQrCodeDto, GenerateQrCodeResponseDto>();
        CreateMap<ConfirmationToken, ConfirmationTokenDto>();
        CreateMap<Company, GenerateQrCodeResponseDto>();
    }
}