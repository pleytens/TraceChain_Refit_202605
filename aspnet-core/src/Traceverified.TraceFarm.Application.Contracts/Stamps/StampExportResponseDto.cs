namespace Traceverified.TraceFarm.Stamps;

public class StampExportResponseDto
{
    public string FileName { get; set; }
    public byte[]? data { get; set; }
    public StampExportResponseDto(string fileName, byte[]? data)
    {
        FileName = fileName;
        this.data = data;
    }
}