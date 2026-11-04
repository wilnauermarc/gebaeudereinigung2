/**
 * E-Rechnung: Prüfung der Pflichtangaben und ZUGFeRD/Factur-X-Näherung (EN 16931, CII-Syntax) als PDF mit eingebettetem XML.
 * Weder der KoSIT-Validator noch PDF/A-3 sind geprüft: vor dem produktiven Versand mit einem Validator und der Steuerberatung abstimmen.
 */
import { AFRelationship, PDFDocument } from 'pdf-lib';
import type { Company } from './company';
import { ibanValid } from './iban';
import type { Customer } from './types';
import type { InvoiceDoc } from './pdf/documentsPdf';

type Cust = Pick<Customer, 'name' | 'street' | 'postal' | 'city' | 'contacts'> & { buyerRef?: string };
export interface Issue { level: 'error' | 'warn'; text: string; /** company = eigene Angaben (bei allen Rechnungen gleich), invoice = nur diese Rechnung */ scope: 'company' | 'invoice' }

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]!);
const eur = (cents: number) => (cents / 100).toFixed(2);
const compact = (s: string) => s.replace(/\s+/g, '');
export const vatIdOf = (s: string) => compact(s.replace(/^USt-IdNr\.?/i, ''));
const isPlaceholderVat = (v: string) => !/^DE\d{9}$/.test(v) || /^DE0+$/.test(v);

/** Pflichtangaben für eine E-Rechnung (XRechnung/ZUGFeRD). Fehler verhindern den Versand, Warnungen nicht. */
export function checkInvoice(company: Company, customer: Cust | undefined, inv: InvoiceDoc): Issue[] {
	const out: Issue[] = [];
	const e = (text: string, scope: Issue['scope'] = 'invoice') => out.push({ level: 'error', text, scope });
	const w = (text: string) => out.push({ level: 'warn', text, scope: 'invoice' });
	if (!company.name.trim() || !company.street.trim() || !company.postal.trim() || !company.city.trim()) e('Absenderadresse unvollständig', 'company');
	if (isPlaceholderVat(vatIdOf(company.taxId))) e('Umsatzsteuer-ID fehlt oder ist ein Platzhalter', 'company');
	if (!ibanValid(company.iban)) e('IBAN fehlt oder ist ungültig', 'company');
	if (!/^\S+@\S+\.\S+$/.test(company.email) || company.email.endsWith('example.com')) e('E-Mail des Absenders fehlt oder ist ein Platzhalter', 'company');
	if (!company.phone.trim()) e('Telefon des Absenders fehlt', 'company');
	if (!customer) return [...out, { level: 'error', text: 'Kunde nicht gefunden.', scope: 'invoice' }];
	if (!customer.street.trim() || !customer.postal.trim() || !customer.city.trim()) e('Kundenadresse unvollständig.');
	if (!customer.buyerRef?.trim()) w('Keine Leitweg-ID: bei Behörden Pflicht, bei Firmen genügt eine Käuferreferenz.');
	if (!customer.contacts[0]?.email) w('Keine Kunden-E-Mail hinterlegt (wird als Empfängeradresse genutzt).');
	if (inv.netCents <= 0) w('Betrag ist null oder negativ: Stornorechnungen bitte als Gutschrift (Typ 381) mit der Steuerberatung abstimmen.');
	if (inv.dueOn < inv.issuedOn) e('Fälligkeitsdatum liegt vor dem Rechnungsdatum.');
	if (!inv.period) w('Kein Leistungszeitraum angegeben.');
	return out;
}

const d102 = (iso: string) => iso.replace(/-/g, '');

/** Factur-X/ZUGFeRD-XML im Profil EN 16931 (CII), Leistung als eine Position. */
export function buildFacturX(o: { company: Company; customer: Cust; invoice: InvoiceDoc; vatRate?: number }): string {
	const { company: c, customer: k, invoice: i } = o;
	const rate = o.vatRate ?? 0.19;
	const net = i.netCents, vat = Math.round(net * rate);
	const pct = (rate * 100).toFixed(2);
	const addr = (street: string, postal: string, city: string) => `<ram:PostalTradeAddress><ram:PostcodeCode>${esc(postal)}</ram:PostcodeCode><ram:LineOne>${esc(street)}</ram:LineOne><ram:CityName>${esc(city)}</ram:CityName><ram:CountryID>DE</ram:CountryID></ram:PostalTradeAddress>`;
	const tax = `<ram:ApplicableTradeTax><ram:TypeCode>VAT</ram:TypeCode><ram:CategoryCode>S</ram:CategoryCode><ram:RateApplicablePercent>${pct}</ram:RateApplicablePercent></ram:ApplicableTradeTax>`;
	return `<?xml version="1.0" encoding="UTF-8"?>
<rsm:CrossIndustryInvoice xmlns:rsm="urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100" xmlns:ram="urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100" xmlns:udt="urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100">
  <rsm:ExchangedDocumentContext><ram:GuidelineSpecifiedDocumentContextParameter><ram:ID>urn:cen.eu:en16931:2017</ram:ID></ram:GuidelineSpecifiedDocumentContextParameter></rsm:ExchangedDocumentContext>
  <rsm:ExchangedDocument><ram:ID>${esc(i.number)}</ram:ID><ram:TypeCode>380</ram:TypeCode><ram:IssueDateTime><udt:DateTimeString format="102">${d102(i.issuedOn)}</udt:DateTimeString></ram:IssueDateTime></rsm:ExchangedDocument>
  <rsm:SupplyChainTradeTransaction>
    <ram:IncludedSupplyChainTradeLineItem>
      <ram:AssociatedDocumentLineDocument><ram:LineID>1</ram:LineID></ram:AssociatedDocumentLineDocument>
      <ram:SpecifiedTradeProduct><ram:Name>${esc(i.description.replace(/\n/g, '; '))}</ram:Name></ram:SpecifiedTradeProduct>
      <ram:SpecifiedLineTradeAgreement><ram:NetPriceProductTradePrice><ram:ChargeAmount>${eur(net)}</ram:ChargeAmount></ram:NetPriceProductTradePrice></ram:SpecifiedLineTradeAgreement>
      <ram:SpecifiedLineTradeDelivery><ram:BilledQuantity unitCode="C62">1</ram:BilledQuantity></ram:SpecifiedLineTradeDelivery>
      <ram:SpecifiedLineTradeSettlement>${tax}<ram:SpecifiedTradeSettlementLineMonetarySummation><ram:LineTotalAmount>${eur(net)}</ram:LineTotalAmount></ram:SpecifiedTradeSettlementLineMonetarySummation></ram:SpecifiedLineTradeSettlement>
    </ram:IncludedSupplyChainTradeLineItem>
    <ram:ApplicableHeaderTradeAgreement>
      <ram:BuyerReference>${esc(k.buyerRef?.trim() || 'n/a')}</ram:BuyerReference>
      <ram:SellerTradeParty><ram:Name>${esc(c.name)}</ram:Name><ram:DefinedTradeContact><ram:PersonName>${esc(c.owner)}</ram:PersonName><ram:TelephoneUniversalCommunication><ram:CompleteNumber>${esc(c.phone)}</ram:CompleteNumber></ram:TelephoneUniversalCommunication><ram:EmailURIUniversalCommunication><ram:URIID>${esc(c.email)}</ram:URIID></ram:EmailURIUniversalCommunication></ram:DefinedTradeContact>${addr(c.street, c.postal, c.city)}<ram:URIUniversalCommunication><ram:URIID schemeID="EM">${esc(c.email)}</ram:URIID></ram:URIUniversalCommunication><ram:SpecifiedTaxRegistration><ram:ID schemeID="VA">${esc(vatIdOf(c.taxId))}</ram:ID></ram:SpecifiedTaxRegistration></ram:SellerTradeParty>
      <ram:BuyerTradeParty><ram:Name>${esc(k.name)}</ram:Name>${addr(k.street, k.postal, k.city)}<ram:URIUniversalCommunication><ram:URIID schemeID="EM">${esc(k.contacts[0]?.email || 'unbekannt@example.invalid')}</ram:URIID></ram:URIUniversalCommunication></ram:BuyerTradeParty>
    </ram:ApplicableHeaderTradeAgreement>
    <ram:ApplicableHeaderTradeDelivery/>
    <ram:ApplicableHeaderTradeSettlement>
      <ram:PaymentReference>${esc(i.number)}</ram:PaymentReference>
      <ram:InvoiceCurrencyCode>EUR</ram:InvoiceCurrencyCode>
      <ram:SpecifiedTradeSettlementPaymentMeans><ram:TypeCode>58</ram:TypeCode><ram:PayeeSpecifiedCreditorFinancialAccount><ram:IBANID>${esc(compact(c.iban))}</ram:IBANID></ram:PayeeSpecifiedCreditorFinancialAccount></ram:SpecifiedTradeSettlementPaymentMeans>
      <ram:ApplicableTradeTax><ram:CalculatedAmount>${eur(vat)}</ram:CalculatedAmount><ram:TypeCode>VAT</ram:TypeCode><ram:BasisAmount>${eur(net)}</ram:BasisAmount><ram:CategoryCode>S</ram:CategoryCode><ram:RateApplicablePercent>${pct}</ram:RateApplicablePercent></ram:ApplicableTradeTax>
      <ram:SpecifiedTradePaymentTerms><ram:Description>Zahlbar bis ${i.dueOn} ohne Abzug</ram:Description><ram:DueDateDateTime><udt:DateTimeString format="102">${d102(i.dueOn)}</udt:DateTimeString></ram:DueDateDateTime></ram:SpecifiedTradePaymentTerms>
      <ram:SpecifiedTradeSettlementHeaderMonetarySummation><ram:LineTotalAmount>${eur(net)}</ram:LineTotalAmount><ram:TaxBasisTotalAmount>${eur(net)}</ram:TaxBasisTotalAmount><ram:TaxTotalAmount currencyID="EUR">${eur(vat)}</ram:TaxTotalAmount><ram:GrandTotalAmount>${eur(net + vat)}</ram:GrandTotalAmount><ram:DuePayableAmount>${eur(net + vat)}</ram:DuePayableAmount></ram:SpecifiedTradeSettlementHeaderMonetarySummation>
    </ram:ApplicableHeaderTradeSettlement>
  </rsm:SupplyChainTradeTransaction>
</rsm:CrossIndustryInvoice>
`;
}

/** Bettet das Factur-X-XML als Anhang „factur-x.xml“ in die Rechnungs-PDF ein (ZUGFeRD-Näherung, kein PDF/A-3). */
export async function embedFacturX(pdf: Uint8Array, xml: string, now = new Date()): Promise<Uint8Array> {
	const doc = await PDFDocument.load(pdf);
	await doc.attach(new TextEncoder().encode(xml), 'factur-x.xml', { mimeType: 'text/xml', description: 'Factur-X/ZUGFeRD Rechnungsdaten (EN 16931)', creationDate: now, modificationDate: now, afRelationship: AFRelationship.Alternative });
	return doc.save({ useObjectStreams: false });
}
