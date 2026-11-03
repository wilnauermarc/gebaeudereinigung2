/**
 * XRechnung-Entwurf (UBL 2.1, Syntax nach EN 16931 / XRechnung 3.0) für eine Pauschal- oder Einzelrechnung.
 * NICHT gegen den KoSIT-Validator geprüft. Vor dem produktiven Versand validieren und mit der Steuerberatung abstimmen.
 */
import type { Company } from '../company';
import type { Customer } from '../types';
import type { InvoiceDoc } from './documentsPdf';

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]!);
const eur = (cents: number) => (cents / 100).toFixed(2);
const compact = (s: string) => s.replace(/\s+/g, '');
const vatId = (s: string) => compact(s.replace(/^USt-IdNr\.?/i, ''));

export interface XRechnungInput {
	company: Company;
	customer: Pick<Customer, 'name' | 'street' | 'postal' | 'city' | 'contacts'>;
	invoice: InvoiceDoc;
	/** Leitweg-ID des Auftraggebers (öffentliche Hand), sonst Referenz des Kunden */
	buyerReference?: string;
	vatRate?: number;
}

export function buildXRechnung(o: XRechnungInput): string {
	const { company: c, customer: k, invoice: i } = o;
	const rate = o.vatRate ?? 0.19;
	const net = i.netCents;
	const vat = Math.round(net * rate);
	const pct = (rate * 100).toFixed(2);
	const contact = k.contacts[0];
	const period = i.period ? `\n  <cac:InvoicePeriod><cbc:StartDate>${i.period}-01</cbc:StartDate><cbc:EndDate>${i.period}-${String(new Date(Date.UTC(+i.period.slice(0, 4), +i.period.slice(5, 7), 0)).getUTCDate()).padStart(2, '0')}</cbc:EndDate></cac:InvoicePeriod>` : '';
	const addr = (name: string, street: string, postal: string, city: string) =>
		`<cac:PostalAddress><cbc:StreetName>${esc(street)}</cbc:StreetName><cbc:CityName>${esc(city)}</cbc:CityName><cbc:PostalZone>${esc(postal)}</cbc:PostalZone><cac:Country><cbc:IdentificationCode>DE</cbc:IdentificationCode></cac:Country></cac:PostalAddress><cac:PartyLegalEntity><cbc:RegistrationName>${esc(name)}</cbc:RegistrationName></cac:PartyLegalEntity>`;
	return `<?xml version="1.0" encoding="UTF-8"?>
<ubl:Invoice xmlns:ubl="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:CustomizationID>urn:cen.eu:en16931:2017#compliant#urn:xeinkauf.de:kosit:xrechnung_3.0</cbc:CustomizationID>
  <cbc:ProfileID>urn:fdc:peppol.eu:2017:poid:billing:01:1.0</cbc:ProfileID>
  <cbc:ID>${esc(i.number)}</cbc:ID>
  <cbc:IssueDate>${i.issuedOn}</cbc:IssueDate>
  <cbc:DueDate>${i.dueOn}</cbc:DueDate>
  <cbc:InvoiceTypeCode>380</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>EUR</cbc:DocumentCurrencyCode>
  <cbc:BuyerReference>${esc(o.buyerReference?.trim() || 'n/a')}</cbc:BuyerReference>${period}
  <cac:AccountingSupplierParty><cac:Party>
    <cbc:EndpointID schemeID="EM">${esc(c.email)}</cbc:EndpointID>
    <cac:PartyName><cbc:Name>${esc(c.name)}</cbc:Name></cac:PartyName>
    ${addr(c.name, c.street, c.postal, c.city).replace('<cac:PartyLegalEntity>', `<cac:PartyTaxScheme><cbc:CompanyID>${esc(vatId(c.taxId))}</cbc:CompanyID><cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme></cac:PartyTaxScheme><cac:PartyLegalEntity>`)}
    <cac:Contact><cbc:Name>${esc(c.owner)}</cbc:Name><cbc:Telephone>${esc(c.phone)}</cbc:Telephone><cbc:ElectronicMail>${esc(c.email)}</cbc:ElectronicMail></cac:Contact>
  </cac:Party></cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty><cac:Party>
    <cbc:EndpointID schemeID="EM">${esc(contact?.email || 'unbekannt@example.invalid')}</cbc:EndpointID>
    <cac:PartyName><cbc:Name>${esc(k.name)}</cbc:Name></cac:PartyName>
    ${addr(k.name, k.street, k.postal, k.city)}
  </cac:Party></cac:AccountingCustomerParty>
  <cac:PaymentMeans><cbc:PaymentMeansCode>58</cbc:PaymentMeansCode><cbc:PaymentID>${esc(i.number)}</cbc:PaymentID><cac:PayeeFinancialAccount><cbc:ID>${esc(compact(c.iban))}</cbc:ID></cac:PayeeFinancialAccount></cac:PaymentMeans>
  <cac:PaymentTerms><cbc:Note>Zahlbar bis ${i.dueOn} ohne Abzug</cbc:Note></cac:PaymentTerms>
  <cac:TaxTotal><cbc:TaxAmount currencyID="EUR">${eur(vat)}</cbc:TaxAmount><cac:TaxSubtotal><cbc:TaxableAmount currencyID="EUR">${eur(net)}</cbc:TaxableAmount><cbc:TaxAmount currencyID="EUR">${eur(vat)}</cbc:TaxAmount><cac:TaxCategory><cbc:ID>S</cbc:ID><cbc:Percent>${pct}</cbc:Percent><cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme></cac:TaxCategory></cac:TaxSubtotal></cac:TaxTotal>
  <cac:LegalMonetaryTotal><cbc:LineExtensionAmount currencyID="EUR">${eur(net)}</cbc:LineExtensionAmount><cbc:TaxExclusiveAmount currencyID="EUR">${eur(net)}</cbc:TaxExclusiveAmount><cbc:TaxInclusiveAmount currencyID="EUR">${eur(net + vat)}</cbc:TaxInclusiveAmount><cbc:PayableAmount currencyID="EUR">${eur(net + vat)}</cbc:PayableAmount></cac:LegalMonetaryTotal>
  <cac:InvoiceLine><cbc:ID>1</cbc:ID><cbc:InvoicedQuantity unitCode="C62">1</cbc:InvoicedQuantity><cbc:LineExtensionAmount currencyID="EUR">${eur(net)}</cbc:LineExtensionAmount><cac:Item><cbc:Name>${esc(i.description)}</cbc:Name><cac:ClassifiedTaxCategory><cbc:ID>S</cbc:ID><cbc:Percent>${pct}</cbc:Percent><cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme></cac:ClassifiedTaxCategory></cac:Item><cac:Price><cbc:PriceAmount currencyID="EUR">${eur(net)}</cbc:PriceAmount></cac:Price></cac:InvoiceLine>
</ubl:Invoice>
`;
}
