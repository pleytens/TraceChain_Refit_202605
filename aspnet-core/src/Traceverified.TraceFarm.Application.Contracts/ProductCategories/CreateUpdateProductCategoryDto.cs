using System.ComponentModel.DataAnnotations;

namespace Traceverified.TraceFarm.ProductCategories;

public class CreateUpdateProductCategoryDto
{
    [Required] public string Name { get; set; }
}