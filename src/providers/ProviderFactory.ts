// src/providers/ProviderFactory.ts

import { BaseProvider } from './base/BaseProvider';
import { ZohoProvider } from './zoho/ZohoProvider';
import { GmailProvider } from './gmail/GmailProvider';
import { OutlookProvider } from './outlook/OutlookProvider';
import { CustomProvider } from './custom/CustomProvider';
import { MailboxConfig, ProviderType } from '../types';

export class ProviderFactory {
  static create(config: MailboxConfig, provider: ProviderType = ProviderType.CUSTOM): BaseProvider {
    switch (provider) {
      case ProviderType.ZOHO:
        return new ZohoProvider(config);
      case ProviderType.GMAIL:
        return new GmailProvider(config);
      case ProviderType.OUTLOOK:
      case ProviderType.MICROSOFT365:
        return new OutlookProvider(config);
      default:
        return new CustomProvider(config);
    }
  }
}
