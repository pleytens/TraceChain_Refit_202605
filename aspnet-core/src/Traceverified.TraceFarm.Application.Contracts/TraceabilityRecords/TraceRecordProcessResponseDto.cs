using System.Collections.Generic;
using Traceverified.TraceFarm.ProcessManagements;

namespace Traceverified.TraceFarm.TraceabilityRecords;

public class TraceRecordProcessResponseDto
{
    public List<ProcessFieldResponseDto> Fields { get; set; }
}