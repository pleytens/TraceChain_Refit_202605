using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Traceverified.TraceFarm.GenerateQRCodeManagement;
using Volo.Abp.AspNetCore.Mvc;

namespace Traceverified.TraceFarm.Controllers;

[Route("api/app")]
public class ConfirmationTokenController(IConfirmationTokenAppService confirmationTokenAppService) : AbpController
{
    [HttpGet("confirmation-token")]
    public async Task<IActionResult> ConfirmToken(string token)
    {
        return await confirmationTokenAppService.ConfirmTokenAsync(token) switch
        {
            EnumConfirmationToken.Null => NotFound(new { Message = L["TokenInvalid"]}),
            EnumConfirmationToken.IsUsed => BadRequest(new { Message = L["TokenAlreadyUsed"] }),
            EnumConfirmationToken.IsExpired => BadRequest(new { Message = L["TokenExpired"]}),
            _ => Ok(new { Message = L["TokenConfirmedSuccessfully"] })
        };
    }

}