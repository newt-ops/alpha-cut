import React, { useState } from 'react';
import { Button } from '@components/ui/Button';
import { Input, Textarea } from '@components/ui/Input';
import { Select } from '@components/ui/Select';
import { AdminSectionHeader } from './AdminSectionHeader';
import {
  IconFileText,
  IconPlus,
  IconCheck,
  IconExternalLink,
  IconDollar,
  IconClose,
  IconChevronRight,
  IconUser,
  IconClock,
} from '@icons/icons';
import { useAuth } from '@context/AuthContext';
import { useToast } from '@components/ui/Toast';

export interface CreateInvoiceStudioProps {
  clients: any[];
  projects: any[];
  contracts: any[];
  onCancel: () => void;
  onInvoiceCreated: () => void;
}

export const CreateInvoiceStudio: React.FC<CreateInvoiceStudioProps> = ({
  clients = [],
  projects = [],
  contracts = [],
  onCancel,
  onInvoiceCreated,
}) => {
  const { apiFetch } = useAuth();
  const { toast } = useToast();

  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedContractId, setSelectedContractId] = useState('');
  const [invoiceTitle, setInvoiceTitle] = useState('Retention Video Editing & Motion Graphics');
  const [currency, setCurrency] = useState<'ETB' | 'USD'>('ETB');
  const [discount, setDiscount] = useState('0');
  const [tax, setTax] = useState('0');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState(
    'Payment due within 14 days of invoice issue date. Thank you for partnering with Alpha Cut Studio!'
  );
  const [submitting, setSubmitting] = useState(false);
  const [issuedInvoice, setIssuedInvoice] = useState<any>(null);

  // Line items state
  const [lineItems, setLineItems] = useState([
    { description: 'Short-Form Video Editing (9:16 Retention Polish)', quantity: 4, unitPrice: 1200 },
    { description: 'Custom Sound Design & Kinetic Typography', quantity: 1, unitPrice: 1500 },
  ]);

  const handleAddLineItem = () => {
    setLineItems((prev) => [...prev, { description: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveLineItem = (index: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    setLineItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const selectedClient = clients.find((c) => c._id === selectedClientId);

  const subtotal = lineItems.reduce((acc, i) => acc + (Number(i.quantity) || 0) * (Number(i.unitPrice) || 0), 0);
  const numDiscount = Number(discount) || 0;
  const numTax = Number(tax) || 0;
  const totalAmount = Math.max(0, subtotal - numDiscount + numTax);

  const handleGenerateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) {
      toast({ message: 'Please select a client for this invoice', type: 'error' });
      return;
    }

    try {
      setSubmitting(true);
      const res = await apiFetch('/api/admin/invoices', {
        method: 'POST',
        body: JSON.stringify({
          clientId: selectedClientId,
          projectId: selectedProjectId || undefined,
          contractId: selectedContractId || undefined,
          title: invoiceTitle,
          currency,
          lineItems,
          discount: numDiscount,
          tax: numTax,
          dueDate: dueDate || undefined,
          notes,
        }),
      });

      if (res.success && res.invoice) {
        toast({ message: `Invoice ${res.invoice.invoiceNumber} successfully issued!`, type: 'success' });
        setIssuedInvoice(res.invoice);
        onInvoiceCreated();
      }
    } catch (err: any) {
      toast({ message: err.message || 'Failed to issue invoice', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportPdfPreview = async () => {
    if (!issuedInvoice) return;
    try {
      const res = await apiFetch(`/api/admin/invoices/${issuedInvoice._id}/pdf`);
      if (res.success && res.pdfData) {
        toast({ message: `PDF document prepared for ${issuedInvoice.invoiceNumber}`, type: 'success' });
        const win = window.open('', '_blank');
        if (win) {
          win.document.write(res.pdfData.htmlPreview);
          win.document.close();
        }
      }
    } catch (err: any) {
      toast({ message: 'PDF Export error', type: 'error' });
    }
  };

  if (issuedInvoice) {
    return (
      <div style={{ display: 'grid', gap: '24px' }}>
        <AdminSectionHeader
          title={`Invoice ${issuedInvoice.invoiceNumber} Issued`}
          subtitle="Official billing statement generated and credited to client balance sheet"
          action={
            <Button variant="secondary" iconLeft={IconChevronRight} onClick={onCancel}>
              Back to Overview
            </Button>
          }
        />

        <div
          style={{
            backgroundColor: 'var(--surface)',
            padding: '36px',
            borderRadius: 'var(--radius-lg)',
            border: '1.5px solid var(--accent-gold)',
            boxShadow: 'var(--shadow)',
            display: 'grid',
            gap: '24px',
            textAlign: 'center',
            maxWidth: '640px',
            margin: '0 auto',
            width: '100%',
          }}
        >
          <div style={{ fontSize: '48px' }}>📄</div>
          <div>
            <span className="font-mono" style={{ fontSize: '12px', color: 'var(--accent-gold)', fontWeight: 800, letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>
              STATEMENT CONFIRMATION
            </span>
            <h2 className="font-display" style={{ fontSize: '24px', color: 'var(--ink)', margin: 0, fontWeight: 800 }}>
              {issuedInvoice.invoiceNumber}
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--ink-soft)', marginTop: '6px' }}>
              Billed to <strong>{issuedInvoice.clientName}</strong> ({issuedInvoice.clientEmail})
            </p>
          </div>

          <div style={{ padding: '20px', backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
            <span className="font-mono" style={{ fontSize: '11px', color: 'var(--ink-soft)', display: 'block', marginBottom: '4px' }}>
              TOTAL BALANCE DUE:
            </span>
            <span className="font-display" style={{ fontSize: '32px', color: 'var(--accent-gold)', fontWeight: 800 }}>
              {issuedInvoice.totalAmount.toLocaleString()} {issuedInvoice.currency}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Button variant="secondary" onClick={handleExportPdfPreview} iconRight={IconExternalLink}>
              Preview Printable PDF ↗
            </Button>
            <Button variant="primary" onClick={() => setIssuedInvoice(null)} iconLeft={IconPlus}>
              Create Another Invoice
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: '28px' }}>
      {/* Section Header with Flexbox Action Alignment */}
      <AdminSectionHeader
        title="Automated Client Invoice & Statement Studio"
        subtitle="Generate official agency billing statements, line-item breakdowns, and client balance sheets."
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Button variant="secondary" iconLeft={IconChevronRight} onClick={onCancel}>
              Back to Overview
            </Button>
            <Button variant="primary" iconLeft={IconFileText} isLoading={submitting} onClick={handleGenerateInvoice}>
              Issue Client Invoice
            </Button>
          </div>
        }
      />

      <form onSubmit={handleGenerateInvoice} style={{ display: 'grid', gap: '24px' }}>
        {/* TOP METADATA GRID (3 Columns) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {/* Card 1: Client Selection */}
          <div style={{ backgroundColor: 'var(--surface)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', display: 'grid', gap: '12px' }}>
            <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 800, letterSpacing: '0.06em' }}>
              1. CLIENT ACCOUNT
            </span>
            <Select
              label="Select Client *"
              value={selectedClientId}
              onChange={(val: any) => {
                const v = typeof val === 'object' && val?.target ? val.target.value : val;
                setSelectedClientId(v);
              }}
              options={[
                { value: '', label: '-- Select Client Account --' },
                ...clients.map((c) => ({ value: c._id, label: `${c.name} (${c.email})` })),
              ]}
            />
            {selectedClient && (
              <div style={{ padding: '14px', backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-gold)', display: 'grid', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {selectedClient.avatarUrl ? (
                    <img src={selectedClient.avatarUrl} alt={selectedClient.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--accent-gold)' }} />
                  ) : (
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(201, 160, 107, 0.2)', border: '1px solid var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)', fontWeight: 800, fontSize: '15px' }}>
                      {selectedClient.name ? selectedClient.name.charAt(0).toUpperCase() : 'C'}
                    </div>
                  )}
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: 'var(--ink)' }}>{selectedClient.name}</h4>
                    <span style={{ fontSize: '12px', color: 'var(--ink-soft)', wordBreak: 'break-all' }}>{selectedClient.email}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--line)', fontSize: '11px' }}>
                  <span style={{ color: selectedClient.telegramChatId ? '#24A1DE' : 'var(--ink-soft)', fontWeight: 700 }}>
                    {selectedClient.telegramChatId ? '✈️ Telegram Linked' : 'Telegram Not Linked'}
                  </span>
                  <span style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>
                    {selectedClient.activeProjectCount ? `${selectedClient.activeProjectCount} Active Workload` : 'Client Account'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Linkage */}
          <div style={{ backgroundColor: 'var(--surface)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', display: 'grid', gap: '12px' }}>
            <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 800, letterSpacing: '0.06em' }}>
              2. LINK PROJECT / RETAINER
            </span>
            <Select
              label="Link Active Project (Optional)"
              value={selectedProjectId}
              onChange={(val: any) => {
                const v = typeof val === 'object' && val?.target ? val.target.value : val;
                setSelectedProjectId(v);
                if (v) {
                  const found = projects.find((p) => p._id === v);
                  if (found) {
                    setInvoiceTitle(`Invoice for ${found.editingStyle}`);
                    setCurrency(found.currency || 'ETB');
                    setLineItems([{ description: `${found.editingStyle} Video Render`, quantity: 1, unitPrice: found.price || 0 }]);
                  }
                }
              }}
              options={[
                { value: '', label: '-- None (Custom Invoice) --' },
                ...projects.map((p) => ({ value: p._id, label: `${p.editingStyle} (${p.price} ${p.currency})` })),
              ]}
            />
            <Select
              label="Link Retainer Plan (Optional)"
              value={selectedContractId}
              onChange={(val: any) => {
                const v = typeof val === 'object' && val?.target ? val.target.value : val;
                setSelectedContractId(v);
                if (v) {
                  const found = contracts.find((c) => c._id === v);
                  if (found) {
                    setInvoiceTitle(`Monthly Retainer (${found.frequency})`);
                    setCurrency(found.currency || 'ETB');
                    setLineItems([{ description: `Monthly Retainer Plan (${found.packageTier} Tier)`, quantity: 1, unitPrice: found.monthlyPrice || 0 }]);
                  }
                }
              }}
              options={[
                { value: '', label: '-- None (Custom Invoice) --' },
                ...contracts.map((c) => ({ value: c._id, label: `${c.frequency} (${c.monthlyPrice} ${c.currency})` })),
              ]}
            />
          </div>

          {/* Card 3: Invoice Terms */}
          <div style={{ backgroundColor: 'var(--surface)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', display: 'grid', gap: '12px' }}>
            <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 800, letterSpacing: '0.06em' }}>
              3. INVOICE TERMS
            </span>
            <Input label="Invoice Title" value={invoiceTitle} onChange={(e) => setInvoiceTitle(e.target.value)} required />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <Select
                label="Currency"
                value={currency}
                onChange={(val: any) => {
                  const v = typeof val === 'object' && val?.target ? val.target.value : val;
                  setCurrency(v as 'ETB' | 'USD');
                }}
                options={[
                  { value: 'ETB', label: 'ETB (Br)' },
                  { value: 'USD', label: 'USD ($)' },
                ]}
              />
              <Input label="Due Date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>
        </div>

        {/* FULL-WIDTH BILLABLE LINE ITEMS TABLE */}
        <div
          style={{
            backgroundColor: 'var(--surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--line)',
            overflow: 'hidden',
            padding: '24px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 className="font-display" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ink)', margin: 0 }}>
                Billable Line Items
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>
                Detailed breakdown of deliverables, motion polish rates, and retainer services
              </span>
            </div>
            <Button type="button" variant="secondary" size="small" iconLeft={IconPlus} onClick={handleAddLineItem}>
              Add Item Row
            </Button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--line)', textAlign: 'left', color: 'var(--accent-gold)' }}>
                  <th style={{ padding: '12px', fontWeight: 700, width: '45%' }}>ITEM DESCRIPTION</th>
                  <th style={{ padding: '12px', fontWeight: 700, width: '12%' }}>QTY</th>
                  <th style={{ padding: '12px', fontWeight: 700, width: '20%' }}>UNIT RATE</th>
                  <th style={{ padding: '12px', fontWeight: 700, width: '18%', textAlign: 'right' }}>AMOUNT</th>
                  <th style={{ padding: '12px', fontWeight: 700, width: '5%', textAlign: 'center' }}></th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, idx) => {
                  const lineTotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--line)' }}>
                      <td style={{ padding: '12px 8px' }}>
                        <Input
                          placeholder="e.g. 9:16 Short-Form Editing"
                          value={item.description}
                          onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                        />
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <Input
                          type="number"
                          value={item.quantity.toString()}
                          onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                        />
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <Input
                          type="number"
                          value={item.unitPrice.toString()}
                          onChange={(e) => handleItemChange(idx, 'unitPrice', Number(e.target.value))}
                        />
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: 800, color: 'var(--ink)' }}>
                        {lineTotal.toLocaleString()} {currency}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        {lineItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveLineItem(idx)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#E53E3E',
                              cursor: 'pointer',
                              padding: '4px',
                            }}
                            title="Remove Line Item"
                          >
                            <IconClose size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* BOTTOM TOTALS & NOTES GRID (2 Columns) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {/* Notes Container */}
          <div style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)' }}>
            <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 800, display: 'block', marginBottom: '8px' }}>
              INVOICE NOTES & PAYMENT INSTRUCTIONS
            </span>
            <Textarea
              rows={5}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter Telebirr / Commercial Bank of Ethiopia (CBE) transfer instructions or Wire details..."
            />
          </div>

          {/* Calculations Summary Container */}
          <div style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--accent-gold)', display: 'grid', gap: '14px' }}>
            <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 800, letterSpacing: '0.06em' }}>
              FINANCIAL STATEMENT SUMMARY
            </span>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', color: 'var(--ink-soft)' }}>
              <span>Subtotal Amount:</span>
              <span style={{ color: 'var(--ink)', fontWeight: 700 }}>{subtotal.toLocaleString()} {currency}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input label="Discount (-)" type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} />
              <Input label="Tax (+)" type="number" value={tax} onChange={(e) => setTax(e.target.value)} />
            </div>

            <div
              style={{
                marginTop: '10px',
                padding: '16px',
                backgroundColor: 'rgba(201, 160, 107, 0.12)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--accent-gold)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <span className="font-mono" style={{ fontSize: '10px', color: 'var(--accent-gold)', fontWeight: 800, display: 'block' }}>
                  GRAND TOTAL BALANCE DUE
                </span>
                <span style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>Includes taxes & agreed discounts</span>
              </div>
              <span className="font-display" style={{ fontSize: '26px', color: 'var(--accent-gold)', fontWeight: 800 }}>
                {totalAmount.toLocaleString()} {currency}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
          <Button type="button" variant="secondary" iconLeft={IconChevronRight} onClick={onCancel}>
            Back to Overview
          </Button>
          <Button type="submit" variant="primary" iconLeft={IconFileText} isLoading={submitting}>
            Issue Client Invoice
          </Button>
        </div>
      </form>
    </div>
  );
};
