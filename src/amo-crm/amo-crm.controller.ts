import { Controller, Get, Query, Param, ParseIntPipe } from '@nestjs/common';
import { AmoCrmService, Lead } from './amo-crm.service';
import { ContactDto } from '../contacts/dto/contact.dto';

@Controller('amo-crm')
export class AmoCrmController {
  constructor(private readonly amoCrmService: AmoCrmService) {}

  @Get('/contacts/:leadName/:leadPrice')
  async findOrCreateContact(
    @Query() contactDto: ContactDto, // Extracting ContactDto from the query parameters
    @Param('leadName') leadName: string, // Extracting leadName from the route parameters
    @Param('leadPrice', new ParseIntPipe()) leadPrice: number, // Parsing leadPrice to an integer using ParseIntPipe
  ): Promise<Lead> {
    try {
      // Attempt to find a contact by phone number
      let contact = await this.amoCrmService.findContact(contactDto.phone);

      if (!contact) {
        // If not found by phone number, try finding by email
        contact = await this.amoCrmService.findContact(contactDto.email);

        if (!contact) {
          // If not found by phone number or email, create a new contact
          contact = await this.amoCrmService.createContact(contactDto);
        }
      }

      // Update the contact's data
      contact = await this.amoCrmService.updateContact(contact.id, contactDto);

      // Create a lead for the contact
      const lead = await this.amoCrmService.createLead(
        contact.id,
        leadName,
        leadPrice,
      );

      // Return the result of creating the lead
      return lead;
    } catch (error) {
      // Handle errors, log them, and rethrow
      console.error(error);
      throw error;
    }
  }
}
