// Licensed to the .NET Foundation under one or more agreements.
// The .NET Foundation licenses this file to you under the MIT license.

import { dotnet } from './_framework/dotnet.js'

const { setModuleImports, getAssemblyExports, getConfig, runMain } = await dotnet
    .withApplicationArguments("start")
    .create();

setModuleImports('main.js', {
    dom: {
        setInnerText: (selector, time) => document.querySelector(selector).innerText = time
    }
});

const config = getConfig();
const exports = await getAssemblyExports(config.mainAssemblyName);

//document.addEventListener('DOMContentLoaded', () => {

    document.querySelectorAll("form").forEach(form => {
        // Build a map of validatable fields and their corresponding validators
        const validatableFields = Array.from(form.querySelectorAll('[data-val="true"]'))
            .reduce((fieldsInfo, field) => {
                const dataValAttrs = field.getAttributeNames()
                    .filter(attr => attr.startsWith("data-val-"))
                    .map(attr => attr.replace("data-val-", ""));
                const validatorNames = dataValAttrs
                    .filter(attr => attr !== "" && !attr.includes("-"));
                const validators = validatorNames.reduce((validatorsInfo, provider) => {
                    let validatorArgs = dataValAttrs
                        .filter(attr => attr.startsWith(`${provider}`))
                        .reduce((validatorInfo, attr) => {
                            const attrValue = field.getAttribute(`data-val-${attr}`);
                            let args = validatorInfo.args || {};
                            if (attr.startsWith(`${provider}-`)) {
                                // Attribute value is a validator argument
                                validatorInfo[attr] = attrValue;
                            } else {
                                // Attribute value is the message
                                validatorInfo.message = attrValue;
                            }
                            validatorInfo.args = args;
                            return validatorInfo;
                        }, {});
                    validatorsInfo[provider] = validatorArgs;
                    return validatorsInfo;
                }, {});
                const fieldName = field.getAttribute("name");
                const fieldDetails = {
                    name: fieldName,
                    element: field,
                    form: form,
                    validators: validators
                };
                fieldsInfo[fieldName] = fieldDetails;
                return fieldsInfo;
            }, {});

        if (Object.keys(validatableFields).length === 0) {
            return;
        }

        // Bind the change event to validate the field
        for (const fieldName in validatableFields) {
            const fieldInfo = validatableFields[fieldName];
            fieldInfo.element.addEventListener("change", () => {
                validateField(fieldInfo);
            });
            fieldInfo.element.addEventListener("blur", () => {
                validateField(fieldInfo);
            });
        }

        // Bind the form's submit event to validate all fields
        form.addEventListener("submit", e => {
            let isValid = true;
            for (const fieldName in validatableFields) {
                isValid = isValid && validateField(validatableFields[fieldName]);
            }
            if (!isValid) {
                fieldInfo.form.classList.remove("is-valid");
                fieldInfo.form.classList.add("is-invalid");
                e.preventDefault();
                e.stopPropagation();
            } else {
                fieldInfo.form.classList.remove("is-invalid");
                fieldInfo.form.classList.add("is-valid");
            }
            form.classList.add("was-validated");
            return isValid;
        });

        function validateField(fieldInfo) {
            for (const validator in fieldInfo.validators) {
                // Invoke the validator function for the current provider
                const validatorArgs = fieldInfo.validators[validator];
                const isValid = exports.ClientValidator.IsValid(validator, validatorArgs, fieldInfo.element.value);
                setCssClass(fieldInfo.element, isValid);
                if (!isValid) {
                    setValidationMessage(fieldInfo, validatorArgs.message);

                    // Set the form to invalid
                    setCssClass(fieldInfo.form, isValid);

                    // Stop validating if the current field is invalid
                    return false;
                }
                setValidationMessage(fieldInfo, "");
            }
            return true;
        }

        function setValidationMessage(fieldInfo, message) {
            const validationMessage = fieldInfo.form.querySelector(`[data-valmsg-for="${fieldInfo.name}"]`);
            validationMessage.innerText = message;
        }

        function setCssClass(element, isValid) {
            element.classList.remove(isValid ? "is-invalid" : "is-valid");
            element.classList.add(isValid ? "is-valid" : "is-invalid");
        }
    })

//});

// run the C# Main() method and keep the runtime process running and executing further API calls
await runMain();
