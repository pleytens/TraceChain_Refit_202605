using System;

namespace Traceverified.TraceFarm.FileManagement;

public class FileInfoDto
{
    public string FileName { get; set; } = string.Empty;
    public string? FileNameRaw { get; set; } = string.Empty;
    public Guid FileId { get; set; }
    public string Url { get; set; }  = string.Empty;
}