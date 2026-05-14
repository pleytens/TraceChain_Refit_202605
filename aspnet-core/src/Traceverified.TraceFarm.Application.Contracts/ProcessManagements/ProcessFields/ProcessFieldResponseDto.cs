using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Traceverified.TraceFarm.ProcessManagements;

public class ProcessFieldResponseDto
{
    public ProcessFieldResponseDto()
    {
        Options = new List<ProcessFieldOptionResponseDto>();
    }

    public Guid Id { get; set; }
    public Guid ProcessFieldId { get; set; }
    public string Name { get; set; }
    public int DataType { get; set; }
    public bool IsObligatory { get; set; }
    public int Position { get; set; }
    public Guid ProcessStepResponseId { get; set; }
    public List<ProcessFieldOptionResponseDto> Options { get; set; }

    [NotMapped] public Guid? ExecutorId { get; set; }
}