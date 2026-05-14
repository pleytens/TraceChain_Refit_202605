using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Threading.Tasks;
using Traceverified.TraceFarm.Companies;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Data;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Identity;

namespace Traceverified.TraceFarm.ProcessManagements;

public class ProcessStepAppService : CrudAppService<
        ProcessStep,
        ProcessStepDto,
        Guid,
        PagedAndSortedResultRequestDto,
        CreateUpdateProcessStepDto>,
    IProcessStepAppService
{
    private readonly IDataFilter _dataFilter;
    private readonly IRepository<ProcessField, Guid> _processFieldRepository;
    private readonly IRepository<ProcessStep, Guid> _processStepRepository;
    private readonly IRepository<ProcessStepUser, Guid> _processStepUserRepository;
    private readonly IRepository<Receptacle, Guid> _receptacleRepository;
    private readonly IRepository<IdentityUser, Guid> _userRepository;

    public ProcessStepAppService(IRepository<Receptacle, Guid> receptacleRepository,
        IRepository<ProcessStep, Guid> processStepRepository,
        IRepository<ProcessField, Guid> processFieldRepository, IRepository<IdentityUser, Guid> userRepository,
        IRepository<ProcessStepUser, Guid> processStepUserRepository, IDataFilter dataFilter) : base(
        processStepRepository)
    {
        _receptacleRepository = receptacleRepository;
        _processStepRepository = processStepRepository;
        _processFieldRepository = processFieldRepository;
        _userRepository = userRepository;
        _processStepUserRepository = processStepUserRepository;
        _dataFilter = dataFilter;
    }

    public async Task<PagedResultDto<ProcessStepDto>> GetListCustomAsync(ProcessStepFilterDto input)
    {
        var processStepQuery = await _processStepRepository.GetQueryableAsync();
        var receptacleRepository = await _receptacleRepository.GetQueryableAsync();
        var query = processStepQuery.Where(n => n.IsDeleted == false && n.ProcessId == input.ProcessId);
        var joinQuery = from processStep in query
            join receptacle in receptacleRepository on processStep.ReceptacleId equals receptacle.Id
                into joined
            from receptacle in joined.DefaultIfEmpty()
            select new ProcessStepDto
            {
                Name = processStep.Name,
                Description = processStep.Description,
                ReceptacleCode = receptacle.Code,
                Id = processStep.Id,
                IsSpecial = processStep.IsSpecial,
                Position = processStep.Position
            };

        var result = joinQuery
            .OrderBy(input.Sorting ?? "Position")
            .Skip(input.SkipCount)
            .Take(input.MaxResultCount).ToList();
        if (result.Count > 0)
        {
            var processFieldQuery = await _processFieldRepository.GetQueryableAsync();
            var userQuery = await _userRepository.GetQueryableAsync();
            var processStepUserQuery = await _processStepUserRepository.GetQueryableAsync();
            foreach (var processStep in result)
            {
                processStep.UserTags = (from processStepUser in processStepUserQuery
                    join user in userQuery on processStepUser.UserId equals user.Id
                    where processStepUser.ProcessStepId == processStep.Id
                          && processStepUser.IsDeleted == false
                    select new ProcessStepUserDto
                    {
                        Id = processStepUser.UserId,
                        Name = user.Name
                    }).ToList();
                processStep.QuestionCount = processFieldQuery.Count(n => n.StepId == processStep.Id);
            }
        }

        return new PagedResultDto<ProcessStepDto>(query.Count(), result);
    }

    public async Task<bool> SetFirstStepAsync(Guid processId, Guid stepId)
    {
        var stepSetFirst =
            await _processStepRepository.FirstOrDefaultAsync(n => n.Id == stepId && n.ProcessId == processId);
        if (stepSetFirst == null)
        {
            return false;
        }

        var stepQuery = await _processStepRepository.GetQueryableAsync();

        // old version
        // var stepInProcess = stepQuery.Where(n =>
        //     n.ProcessId == processId && n.IsSpecial == (int)StepSpecialEnum.First);
        // foreach (var step in stepInProcess)
        // {
        //     step.IsSpecial = (int)StepSpecialEnum.Normal;
        //     await _processStepRepository.UpdateAsync(step);
        // }

        var stepInProcess = stepQuery.Where(n => n.ProcessId == processId && n.Id != stepId).OrderBy(n => n.Position)
            .ToList();
        for (var i = 0; i < stepInProcess.Count(); i++)
        {
            if (stepInProcess[i].IsSpecial == (int)StepSpecialEnum.First)
            {
                stepInProcess[i].IsSpecial = (int)StepSpecialEnum.Normal;
            }

            stepInProcess[i].Position = i + 2;
            await _processStepRepository.UpdateAsync(stepInProcess[i]);
        }

        stepSetFirst.IsSpecial = (int)StepSpecialEnum.First;
        stepSetFirst.Position = 1;
        await _processStepRepository.UpdateAsync(stepSetFirst);
        return true;
    }

    public async Task<bool> SetLastStepAsync(Guid processId, Guid stepId)
    {
        var stepSetLast =
            await _processStepRepository.FirstOrDefaultAsync(n => n.Id == stepId && n.ProcessId == processId);
        if (stepSetLast == null)
        {
            return false;
        }

        var stepQuery = await _processStepRepository.GetQueryableAsync();
        // old version
        // var stepInProcess = stepQuery.Where(n =>
        //     n.ProcessId == processId && n.IsDeleted == false && n.IsSpecial == (int)StepSpecialEnum.Last);
        // foreach (var step in stepInProcess)
        // {
        //     step.IsSpecial = (int)StepSpecialEnum.Normal;
        //     await _processStepRepository.UpdateAsync(step);
        // }
        var stepInProcess = stepQuery.Where(n => n.ProcessId == processId && n.Id != stepId).OrderBy(n => n.Position)
            .ToList();
        for (var i = 0; i < stepInProcess.Count(); i++)
        {
            if (stepInProcess[i].IsSpecial == (int)StepSpecialEnum.Last)
            {
                stepInProcess[i].IsSpecial = (int)StepSpecialEnum.Normal;
            }

            stepInProcess[i].Position = i + 1;
            await _processStepRepository.UpdateAsync(stepInProcess[i]);
        }

        stepSetLast.Position = stepInProcess.Count + 1;
        stepSetLast.IsSpecial = (int)StepSpecialEnum.Last;
        await _processStepRepository.UpdateAsync(stepSetLast);
        return true;
    }

    public async Task<bool> UpdateMultipleStepAsync(List<UpdateStepPositionDto> steps)
    {
        var stepQuery = await _processStepRepository.GetListAsync(n => steps.Select(g => g.Id).Contains(n.Id));
        foreach (var step in stepQuery.Where(step => step.IsSpecial == (int)StepSpecialEnum.Normal))
        {
            step.Position = steps.FirstOrDefault(n => n.Id == step.Id)!.Position;
        }

        await _processStepRepository.UpdateManyAsync(stepQuery);
        return true;
    }

    public override async Task<ProcessStepDto> CreateAsync(CreateUpdateProcessStepDto input)
    {
        input.IsSpecial = (int)StepSpecialEnum.Normal;
        var processStepQuery = await _processStepRepository.GetListAsync(n => n.ProcessId == input.ProcessId);
        switch (processStepQuery.Count)
        {
            case 0:
                input.IsSpecial = (int)StepSpecialEnum.First;
                input.Position = 1;
                break;
            case > 0:
            {
                var lastStep = processStepQuery.FirstOrDefault(n => n.IsSpecial == (int)StepSpecialEnum.Last);

                if (lastStep != null)
                {
                    input.Position = lastStep.Position;
                    lastStep.Position += 1;
                    await _processStepRepository.UpdateAsync(lastStep);
                }
                else
                {
                    input.Position = processStepQuery.Max(n => n.Position) + 1;
                }

                break;
            }
        }


        var output = await base.CreateAsync(input);
        var processStepUsers = input.UserTagIds.Select(userId => new ProcessStepUser
        {
            TenantId = CurrentTenant.Id,
            ProcessStepId = output.Id,
            UserId = userId
        });
        await _processStepUserRepository.InsertManyAsync(processStepUsers);

        return output;
    }

    public override async Task<ProcessStepDto> UpdateAsync(Guid id, CreateUpdateProcessStepDto input)
    {
        var processStepUserQuery = await _processStepUserRepository.GetQueryableAsync();
        var processStepUser = processStepUserQuery.Where(n => n.ProcessStepId == id);
        await _processStepUserRepository.DeleteManyAsync(processStepUser);
        foreach (var userId in input.UserTagIds)
        {
            var processStepUserEntity = new ProcessStepUser
            {
                TenantId = CurrentTenant.Id,
                ProcessStepId = id,
                UserId = userId
            };
            await _processStepUserRepository.InsertAsync(processStepUserEntity);
        }

        return await base.UpdateAsync(id, input);
    }

    public override async Task<ProcessStepDto> GetAsync(Guid id)
    {
        var output = await base.GetAsync(id);
        if (output == null)
        {
            throw new UserFriendlyException(L["Process:Step:Not:Found"]);
        }

        var userQuery = await _userRepository.GetQueryableAsync();
        var processStepUserQuery = await _processStepUserRepository.GetQueryableAsync();
        output.UserTags = (from processStepUser in processStepUserQuery
            join user in userQuery on processStepUser.UserId equals user.Id
            where processStepUser.ProcessStepId == output.Id
                  && processStepUser.IsDeleted == false
            select new ProcessStepUserDto
            {
                Id = processStepUser.UserId,
                Name = user.Name
            }).ToList();
        return output;
    }
    // public async Task
}