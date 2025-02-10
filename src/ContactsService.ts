/// <reference lib="dom.iterable" />
import { ValidationService }  from './ValidationService';

type Selectors = Record<string, string>;

type Contact = {
    id: string;
    name: string;
    vacancy: string;
    phone: string;
    letter: string;
}

export class ContactsService {
    public selectors: Selectors = {
        addButton: 'data-js-add',
        deleteButton: 'data-js-delete',
        editButton: 'data-js-edit',
        editOpenButton: 'data-js-edit-open',
        clearButton: 'data-js-clear',
        searchButton: 'data-js-search',
        showAllButton: 'data-js-show-all',
        contactIdAttr: 'data-js-contact-id',
        searchInput: 'data-js-search-input',
        searchResultField: '[data-js-search-result]',
        contactId: '[data-js-contact-id]',
        searchInputField: '[data-js-search-input]',
        formElement: '[data-js-form]',
        contactItem: '.contact-list__item',
        pageLetter: '.contact-list__page-',
        pageElement: '.contact-list__page',
        contactsPage: 'contact-list__page',
        contactsSearchResult: '.contact-list__search-result',
        contactsSearchModal: 'contact-list__search-modal',
        btnClose: 'btn-close',
    }

    public validationService: ValidationService = new ValidationService();
    public contacts: Contact[] = [];

    addContactOnScreen(contact: Contact): string {
        const html = `
            <div class="contact-list__item" data-js-contact-id="${contact.id}">
                <span class="contact-list__name">${contact.name}</span>
                <span class="contact-list__vacancy">${contact.vacancy}</span>
                <span class="contact-list__phone">${contact.phone}</span>
                <button class="contact-list__edit" data-js-edit-open data-bs-toggle="modal" data-bs-target=".contact-list__edit-modal">
                    <img src="edit.svg" data-js-edit-open alt="Редактировать" class="contact-list__edit-img"></img>
                </button>
                <button class="contact-list__delete" data-js-delete>
                    <img src="bucket.svg" alt="Удалить" class="contact-list__edit-img" data-js-delete></img>
                </button>
            </div>
        `;
        return html;
    }

    addContact(event: SubmitEvent): void {
        const target = event.target;
        if (!(target instanceof HTMLFormElement)) return;

        const formData = new FormData(event.target as HTMLFormElement);
        const contact: Contact = {
            id: 'id_' + (localStorage.length + 1),
            name: formData.get("name") as string,
            letter: formData.get("name").slice(0, 1) as string,
            vacancy: formData.get("vacancy") as string,
            phone: formData.get("phone") as string,
        }

        const pageElement: Element = document.querySelector(this.selectors.pageLetter + contact.letter) as Element;

        if (this.validationService.validateForm(target.closest(this.selectors.formElement))) {
            localStorage.setItem(contact.id, JSON.stringify(contact));
            pageElement.innerHTML += this.addContactOnScreen(contact);
            this.updateContacts();
            const addForm: HTMLFormElement = target.closest(this.selectors.formElement) as HTMLFormElement;
            addForm.reset();
        }
    }

    getContactsFromLS(): void {
        const keys: string[] = Object.keys(localStorage);
        this.contacts = [];
        keys.forEach((key: string) => {
            this.contacts.push(JSON.parse(<string>localStorage.getItem(key)));
        })
    }

    editContact(event: SubmitEvent, id: string): void {
        const target = event.target;
        if (!(target instanceof HTMLFormElement)) return;

        if (this.validationService.validateForm(target.closest(this.selectors.formElement))) {
            localStorage.removeItem(id);

            const formData = new FormData(event.target as HTMLFormElement);
            const letter: string = formData.get("name").slice(0, 1) as string;
            formData.append("letter", letter);

            localStorage.setItem(id.toString(), JSON.stringify(Object.fromEntries(formData)));
            this.updateContacts();
        }
    }

    openEditContact(id: string): void {
        const contact: Contact = JSON.parse(<string>localStorage.getItem(id));
        let editForm: HTMLFormElement = document.getElementById('edit-form') as HTMLFormElement;
        let editName: HTMLFormElement = document.getElementById('edit-name') as HTMLFormElement;
        let editVacancy: HTMLFormElement = document.getElementById('edit-vacancy') as HTMLFormElement;
        let editPhone: HTMLFormElement = document.getElementById('edit-phone') as HTMLFormElement;

        editName.value = contact.name;
        editVacancy.value = contact.vacancy;
        editPhone.value = contact.phone;

        editForm.setAttribute(this.selectors.contactIdAttr, id);
    }

    searchContacts(query: string): Contact[] {
        return Object.keys(localStorage)
            .map(key => JSON.parse(localStorage.getItem(key) as string))
            .filter(contact => contact.name.toLowerCase().includes(query));
    }

    addSearchedContactsOnScreen(query: string): void {
        const contacts: Contact[] = this.searchContacts(query);

        const searchResultElement: HTMLElement = document.querySelector(this.selectors.searchResultField) as HTMLElement;
        searchResultElement.innerHTML = '';

        contacts.forEach(contact => {
            searchResultElement.innerHTML += this.addContactOnScreen(contact);
        })
    }

    showContacts(event: MouseEvent): void {
        const items: HTMLElement[] = Array.from((event.target as HTMLElement).querySelectorAll(this.selectors.contactItem));

        items.forEach((item:HTMLElement) => {
            item.classList.toggle('show');
        });
    }

    showAllContacts(): void {
        this.getContactsFromLS();
        this.contacts.forEach((contact: Contact) => {
            const searchResultElement: HTMLElement = document.querySelector(this.selectors.searchResultField) as HTMLElement;
            searchResultElement.innerHTML += this.addContactOnScreen(contact);
        })
    }

    updateContacts(): void {
        this.getContactsFromLS();

        if (this.contacts.length > 0) {
            const clearButton: HTMLElement = document.querySelector('[data-js-clear]');
            clearButton.removeAttribute('disabled');

            // собираем информацию о кол-ве контактов по каждой букве
            let letters: string[] = this.contacts.map(contact => contact.letter);
            letters = letters.filter((letter, index) => letters.indexOf(letter) === index);

            type Counter = { letter:string; count:number };
            let counters: Counter[] = letters.map(letter => {
                return {
                    letter: letter,
                    count: this.contacts.filter(contact => contact.letter === letter).length
                };
            });

            //добавляем баджи на страницу
            counters.map(counter => {
                const pageElement: Element = document.querySelector(this.selectors.pageLetter + counter.letter) as Element;
                pageElement.innerHTML = '';
                pageElement.innerHTML += "<span>" + counter.letter + "</span>" + ` <span class="badge text-bg-secondary">${counter.count}</span>`;
            })

            this.contacts.map((contact: Contact) => {
                const pageElement: Element  = document.querySelector(this.selectors.pageLetter + contact.letter) as Element;
                pageElement.innerHTML += this.addContactOnScreen(contact);
            })
        } else {
            document.querySelectorAll('.badge').forEach((item) => {
                item.remove();
            })
        }
    }

    deleteContact(id:string): void {
        localStorage.removeItem(id);
        const contactToDelete: HTMLElement = document.querySelector(this.selectors.contactItem) as HTMLElement;
        contactToDelete.remove();
        this.updateContacts();
    }

    clearContacts(): void {
        this.getContactsFromLS();
        this.contacts.forEach((contact: Contact) => {
            this.deleteContact(contact.id);
        })

        localStorage.clear();
        this.updateContacts()
        const clearButton: HTMLElement = document.querySelector('[data-js-clear]');
        clearButton.setAttribute('disabled', 'didsabled');
    }

    clearModalSearchContacts(): void {
        const contactsSearchResult: HTMLElement = document.querySelector(this.selectors.contactsSearchResult);
        contactsSearchResult.innerHTML = '';
    }
}