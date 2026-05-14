# Repository Guidelines

## Project Structure & Module Organization
The solution `Traceverified.TraceFarm.sln` keeps all projects aligned. Core code lives under `src/`, split into ABP layers: `Traceverified.TraceFarm.Domain*` for core entities, `...Application*` for use cases, `...EntityFrameworkCore` for persistence, `...HttpApi` for controllers, `...HttpApi.Host` for the runnable web host, and `...DbMigrator` for applying migrations. Shared DTO contracts sit in `Traceverified.TraceFarm.Application.Contracts`. Tests mirror the same layout inside `test/`, with `Traceverified.TraceFarm.TestBase` providing common fixtures and fakes.

## Build, Test & Development Commands
Run `dotnet restore Traceverified.TraceFarm.sln` to pull NuGet packages defined in `common.props`. Build with `dotnet build Traceverified.TraceFarm.sln --no-restore`. Execute all backend tests via `dotnet test Traceverified.TraceFarm.sln --no-build`. Start the host locally by running `ASPNETCORE_ENVIRONMENT=Development dotnet run --project src/Traceverified.TraceFarm.HttpApi.Host`. Execute database migrations with `dotnet run --project src/Traceverified.TraceFarm.DbMigrator`. Frontend assets for the host use Yarn; install dependencies with `yarn install --cwd src/Traceverified.TraceFarm.HttpApi.Host`.

## Coding Style & Naming Conventions
C# projects target `net7.0` with `LangVersion latest`; keep four-space indentation and `nullable` enabled. Follow standard .NET naming: PascalCase for types and public members, camelCase for locals and parameters, suffix async methods with `Async`, and favour expressive test method names. Retain module boundaries by only referencing adjacent layer projects. For JS/JSON assets under `src/Traceverified.TraceFarm.HttpApi.Host`, apply the repo `.prettierrc` (single quotes, 4-space indent).

## Testing Guidelines
xUnit is used across `test/` (see `[Fact]` tests in each module). Add unit or integration tests alongside the project affected, naming files `*Tests.cs` and methods `Should_*` to describe behaviour. Leverage `Traceverified.TraceFarm.TestBase` for `AbpIntegratedTest` infrastructure, seed data, and DI helpers. Always run `dotnet test --no-build` before pushing and include coverage considerations for new domain rules or application services.

## Commit & Pull Request Guidelines
Keep commit subjects short, imperative, and scoped (recent history uses “Fix ...” and “Update ...”). Squash noisy WIP history before merging. Pull requests should describe the change, link to TraceVerified issues, call out schema migrations or configuration impacts, and attach screenshots for UI modifications. Note which tests were run and mention any follow-up tasks.

## Configuration & Environment
Configuration lives in `src/Traceverified.TraceFarm.HttpApi.Host/appsettings*.json`; avoid committing secrets—use `app_test.secrets.json` locally. Update `NuGet.Config` cautiously if feeds change, and align SDK versions via `global.json`. Database connection strings and external service keys should be injected through environment variables when deploying.
