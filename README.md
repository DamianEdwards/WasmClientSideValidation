# Client-side validation using .NET WebAssembly

## What is this?

This is an experiment to investigate implementing [ASP.NET Core client-side validation](https://learn.microsoft.com/aspnet/core/mvc/models/validation#client-side-validation) using the actual `ValidationAttribute`s in `System.ComponentModel.DataAnnotations` running in the browser via .NET WebAssembly, rather than relying on [jQuery-based validation or another JavaScript-based replacement](https://andrewlock.net/adding-client-side-validation-to-aspnet-core-without-jquery-or-unobtrusive-validation/). To be clear, I think Phil Haack's [aspnet-client-validation package](https://www.npmjs.com/package/aspnet-client-validation) is awesome and you should definitely use it. This is just about scratching an itch I had. I mean, we run the validation on the server thanks to the validation attributes in .NET, and we have [.NET in WebAssembly](https://learn.microsoft.com/aspnet/core/client-side/dotnet-interop/) now, so what would it look like to run the exact same validation logic in the client, rather than a substitute that doesn't exactly map one-to-one with what runs on the server?

Right now the *ClientSideValidator* project publishes down to 882 KB of downloadable assets which isn't too bad but there's still quite a bit of the BCL preserved that shouldn't be needed.

## Pre-requisites

See the [.NET WebAssembly](https://learn.microsoft.com/aspnet/core/client-side/dotnet-interop/) documentation for full details, but at a minimum you'll need:

- .NET 9 SDK
- The `wasm-tools` workload: `dotnet workload install wasm-tools`
- Optionally, the `wasm-experimental` workload which adds some templates: `dotnet workload install wasm-experimental`
- Visual Studio, VS Code with C# Dev Kit, or your C# editor/IDE of choice

## Running the sample

Open the *WasmClientSideValidation.sln* solution in Visual Studio or VS Code with C# Dev Kit, and run the *ClientSideValidator* project.

You can also just run it from the command line using the .NET CLI, e.g. from the repo root:

```shell
dotnet run --project ./ClientSideValidator
```

The ASP.NET Core project in the solution isn't wired up at all yet so can be ignored, but the idea is I'll wire up the full end-to-end soon. The *wwwroot/index.html* file in the *ClientSideValidator* project contains markup for a form similar to what ASP.NET Core MVC/Razor Pages will output based on Model state, Tag Helpers, etc., i.e. it contains the `data-val-*` attributes that the jQuery-based validation uses.

Once running you can navigate to the very basic sample page and interact with the form fields. The fields will be validated when they lose focus or the value is changed, and when the form is submittted.

## Publishing the sample to inspect the output size

You can publish the *ClientSideValidator* project to inspect the output size. From the command line, e.g. from the repo root:
```shell
dotnet publish ./ClientSideValidator
```

The output will be in the *./artifacts/publish/ClientSideValidator/wwwroot/_framework_* directory. Sum the size of all the *.br* files in that directory to get the total downloadable size of the WebAssembly app.
