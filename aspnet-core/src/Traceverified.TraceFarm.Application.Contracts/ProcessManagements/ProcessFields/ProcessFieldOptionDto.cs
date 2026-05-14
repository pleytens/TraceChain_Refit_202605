using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Traceverified.TraceFarm.ProcessManagements;

public class ProcessFieldOptionDto
{
    public Guid Id { get; set; }
    public string OptionValue { get; set; }

    /// <summary>
    ///     Using for display in ngx-bootstrap-multiselect
    /// </summary>
    [NotMapped]
    public string? Name { get; set; }
}