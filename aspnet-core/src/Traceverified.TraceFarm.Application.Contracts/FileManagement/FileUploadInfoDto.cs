using Volo.Abp.Content;

namespace Traceverified.TraceFarm.FileManagement;

public class FileUploadInfoDto
{
    public string ImageType { get; set; }
    public IRemoteStreamContent File { get; set; }
}