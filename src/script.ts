/// <reference lib="dom.iterable" />
import { ContactsService } from "./ContactsService";
import { ValidationService } from "./ValidationService";
import { MaskedTextChangedListener } from 'ts-input-mask';

let contactList: ContactsService = new ContactsService();
let validationService: ValidationService = new ValidationService();

window.onload = () => {
    contactList.updateContacts();
}

document.addEventListener('submit', (event: SubmitEvent): void => {
    event.preventDefault();
    const isAdd: boolean = <boolean>event.submitter?.hasAttribute(contactList.selectors.addButton);
    const isEdit: boolean = <boolean>event.submitter?.hasAttribute(contactList.selectors.editButton);
    const target: HTMLElement = event.target as HTMLElement;

    if (isAdd) {
        contactList.addContact(event);
    }

    if (isEdit) {
        contactList.editContact(event, target.closest(contactList.selectors.contactId).getAttribute(contactList.selectors.contactIdAttr) as string);
    }
});

document.addEventListener('input', (event: InputEvent): void => {
    const target = event.target as HTMLInputElement;
    const query: string = target.value.toLowerCase();
    contactList.addSearchedContactsOnScreen(query);
});

document.addEventListener('blur', (event: FocusEvent): void => {
    validationService.validationOnBlur(event);
}, {capture: true});

document.addEventListener('click', (event: MouseEvent): void => {
    const target: HTMLElement = event.target as HTMLElement;

    const isDelete: boolean = <boolean>target.hasAttribute(contactList.selectors.deleteButton);
    const isClear: boolean = target.hasAttribute(contactList.selectors.clearButton);
    const isShowAll: boolean = <boolean>target.hasAttribute(contactList.selectors.showAllButton);
    const isEditOpen: boolean = <boolean>target.hasAttribute(contactList.selectors.editOpenButton);
    const isShowContacts: boolean = <boolean>target.classList.contains(contactList.selectors.contactsPage);
    const isModalClosedByButton: boolean = <boolean>target.classList.contains(contactList.selectors.btnClose);
    const isModalClosedBg: boolean = <boolean>target.classList.contains(contactList.selectors.contactsSearchModal);

    if (isDelete) {
        contactList.deleteContact(target.closest(contactList.selectors.contactId).getAttribute(contactList.selectors.contactIdAttr) as string);
    }

    if (isClear) {
        contactList.clearContacts();
    }

    if (isShowAll) {
        contactList.showAllContacts();
    }

    if (isEditOpen) {
        contactList.openEditContact(target.closest(contactList.selectors.contactId).getAttribute(contactList.selectors.contactIdAttr) as string);
    }

    if (isShowContacts) {
        contactList.showContacts(event);
    }

    if (isModalClosedByButton || isModalClosedBg) {
        contactList.clearModalSearchContacts();
    }
});


// @ts-ignore
const listener: MaskedTextChangedListener = MaskedTextChangedListener.installOn(
    '+7[0000000000]',
    document.getElementById('phone') as HTMLInputElement,
    new class implements MaskedTextChangedListener.ValueListener {
        public onTextChanged(
            // @ts-ignore
            maskFilled: boolean,
            // @ts-ignore
            extractedValue: string,
            // @ts-ignore
            formattedText: string
        ): void {

        }
    }()
);

// @ts-ignore
const editListener: MaskedTextChangedListener = MaskedTextChangedListener.installOn(
    '+7[0000000000]',
    document.getElementById('edit-phone') as HTMLInputElement,
    new class implements MaskedTextChangedListener.ValueListener {
        public onTextChanged(
            // @ts-ignore
            maskFilled: boolean,
            // @ts-ignore
            extractedValue: string,
            // @ts-ignore
            formattedText: string
        ): void {

        }
    }()
);