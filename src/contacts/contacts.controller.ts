import { Controller, Get, Param } from '@nestjs/common';
import { ContactsService } from './contacts.service';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get('/:contactId')
  async getContact(@Param('contactId') contactId: string) {
    try {
      const contact = await this.contactsService.getContact(contactId);
      return contact;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
