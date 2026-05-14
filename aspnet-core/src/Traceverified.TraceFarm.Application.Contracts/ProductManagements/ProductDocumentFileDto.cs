using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Security.Policy;
using NPOI.Util;
using Volo.Abp.Application.Dtos;

namespace Traceverified.TraceFarm.ProductManagements;

public class ProductDocumentFileDto
{
    public Guid Id { get; set; }
    public string Url { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
}