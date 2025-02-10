type Selectors = Record<string, string>;

export class ValidationService {
    private selectors: Selectors = {
        errorMessage: '[data-js-error-message]',
        formElement: '[data-js-form]',
    }

    private errorMessages = {
        valueMissing: (): string => 'Пожалуйста, заполните это поле',
        patternMismatch: ({title}) => title || 'Данные не соответствуют формату',
        tooShort: (): string => 'Слишком короткое значение, минимальная длина 3 символа',
        tooLong: (): string => 'Слишком короткое значение, максимальная длина 20 символов',
    }

    manageErrors(fieldControlElement: HTMLInputElement, errorMessages: string[]): void {
        const fieldErrorsElement: HTMLElement = fieldControlElement.parentElement.querySelector(this.selectors.errorMessage) as HTMLElement;
        fieldErrorsElement.textContent = errorMessages.map((message: string): string => `${message}`)
            .join('');

    }

    validateField(fieldControlElement: HTMLInputElement): boolean {
        const errors: ValidityState = fieldControlElement.validity;
        const errorMessages: string[] = [];

        Object.entries(this.errorMessages).forEach(([errorType, getErrorMessage]) => {
            if (errors[errorType]) {
                errorMessages.push(getErrorMessage(fieldControlElement) as string);
            }
        })

        this.manageErrors(fieldControlElement, errorMessages);

        const isValid: boolean = errorMessages.length === 0;
        fieldControlElement.ariaInvalid = isValid ? "false" : "true";
        return isValid
    }

    validateForm(formElement: HTMLFormElement): boolean {
        const requiredControlElements: Element[] = Array.from(formElement.elements).filter(({ required }: HTMLFormElement) => required);
        let isFormValid: boolean = true;
        let firstInvalidFieldControl: HTMLInputElement;

        requiredControlElements.forEach((element: HTMLInputElement) => {
            const isFieldValid: boolean = this.validateField(element);

            if (!isFieldValid) {
                isFormValid = false;

                if (!firstInvalidFieldControl) {
                    firstInvalidFieldControl = element;
                }
            }
        })

        if (!isFormValid) {
            firstInvalidFieldControl.focus();
        }
        return isFormValid
    }

    validationOnBlur(event: FocusEvent): void {
        const target = event.target as HTMLInputElement;
        const isFormField: HTMLFormElement = target.closest(this.selectors.formElement) as HTMLFormElement;
        const isRequired: boolean = target.required;

        if (isFormField && isRequired) {

            this.validateField(target);
        }
    }
}
