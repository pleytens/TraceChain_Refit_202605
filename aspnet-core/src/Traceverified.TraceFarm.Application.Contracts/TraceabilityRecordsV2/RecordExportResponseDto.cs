namespace Traceverified.TraceFarm.TraceabilityRecordsV2;

public class RecordExportResponseDto
{
    public string FileName { get; set; }
    public byte[]? data { get; set; }
    
    public RecordExportResponseDto(string fileName, byte[]? data)
    {
        FileName = fileName;
        this.data = data;
    }
}