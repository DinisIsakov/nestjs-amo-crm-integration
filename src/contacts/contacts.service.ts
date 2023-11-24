import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ContactsService {
  async getContact(contactId: string): Promise<any> {
    try {
      const response = await axios.get(
        `https://markaprodazh.amocrm.ru/api/v4/contacts/${contactId}`,
      );

      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
