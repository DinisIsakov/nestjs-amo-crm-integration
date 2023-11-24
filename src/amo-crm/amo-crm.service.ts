import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ContactDto } from '../contacts/dto/contact.dto';
import { JwtPayload, jwtDecode } from 'jwt-decode';
import axios, { AxiosResponse } from 'axios';

export interface Contact {
  id: number;
  name: string;
}

export interface Lead {
  id: number;
  name: string;
}

@Injectable()
export class AmoCrmService {
  private accessToken = this.configService.get('ACCESS_TOKEN');
  private refreshToken = this.configService.get('REFRESH_TOKEN');
  private clientId = this.configService.get('CLIENT_ID');
  private clientSecret = this.configService.get('CLIENT_SECRET');
  private redirectUrl = this.configService.get('REDIRECT_URL');

  constructor(private configService: ConfigService) {}

  async findContact(query: string): Promise<Contact | null> {
    await this.refreshTokenIfNeeded();

    const res: AxiosResponse = await axios.get(
      `https://markaprodazh.amocrm.ru/api/v4/contacts?query=${query}`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      },
    );

    if (res.status === 204) {
      return null;
    } else {
      return res.data._embedded.contacts[0];
    }
  }

  async createContact(contactQuery: ContactDto): Promise<Contact> {
    const json = [
      {
        name: contactQuery.name,
        custom_fields_values: [
          {
            field_code: 'PHONE',
            values: [
              {
                value: contactQuery.phone,
              },
            ],
          },
          {
            field_code: 'EMAIL',
            values: [
              {
                value: contactQuery.email,
              },
            ],
          },
        ],
      },
    ];

    const res: AxiosResponse = await axios.post(
      `https://markaprodazh.amocrm.ru/api/v4/contacts`,
      json,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      },
    );

    return res.data._embedded.contacts[0];
  }

  async updateContact(
    contactId: number,
    contactDto: ContactDto,
  ): Promise<Contact> {
    const json = {
      name: contactDto.name,
      custom_fields_values: [
        {
          field_code: 'PHONE',
          values: [
            {
              value: contactDto.phone,
            },
          ],
        },
        {
          field_code: 'EMAIL',
          values: [
            {
              value: contactDto.email,
            },
          ],
        },
      ],
    };

    const res: AxiosResponse = await axios.patch(
      `https://markaprodazh.amocrm.ru/api/v4/contacts/${contactId}`,
      json,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      },
    );

    return res.data;
  }

  async createLead(
    contactId: number,
    leadName: string,
    leadPrice: number,
  ): Promise<Lead> {
    const json = [
      {
        name: leadName,
        price: leadPrice,
        _embedded: {
          contacts: [
            {
              id: contactId,
            },
          ],
        },
      },
    ];

    const res: AxiosResponse = await axios.post(
      `https://markaprodazh.amocrm.ru/api/v4/leads`,
      json,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      },
    );

    return res.data._embedded.leads[0];
  }

  async refreshTokenIfNeeded(): Promise<void> {
    const decoded = jwtDecode<JwtPayload>(this.accessToken);
    const now = Math.round(new Date().getTime() / 1000);

    if (now >= decoded.exp) {
      const json = {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken,
        redirect_uri: this.redirectUrl,
      };

      const res: AxiosResponse = await axios.post(
        `https://markaprodazh.amocrm.ru/oauth2/access_token`,
        json,
      );

      this.accessToken = res.data.access_token;
      this.refreshToken = res.data.refresh_token;
    }
  }
}
