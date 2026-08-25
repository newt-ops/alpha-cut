import React, { useState } from 'react';
import { Modal } from '@components/ui/Modal';
import { Button } from '@components/ui/Button';
import { Input, Textarea } from '@components/ui/Input';
import { Select } from '@components/ui/Select';
import { IconFileText, IconPlus, IconCheck, IconExternalLink, IconDollar } from '@icons/icons';
import { useAuth } from '@context/AuthContext';
import { useToast } from '@components/ui/Toast';

export interface InvoiceGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: any[];
  projects: any[];
  contracts: any[];
  onInvoiceCreated?: () => void;
}

export const InvoiceGeneratorModal: React.FC<InvoiceGeneratorModalProps> = ({
  isOpen,
  onClose,
  clients,
  projects,
  contracts,
  onInvoiceCreated,
}) => {
  const { apiFetch } = useAuth();
  const { toast } = useToast();

  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedContractId, setSelectedContractId] = useState('');
  const [invoiceTitle, setInvoiceTitle] = useState('Video Editing Services');
  const [currency, setCurrency] = useState<'ETB' | 'USD'>('ETB');
  const [discount, setDiscount] = useState('0');
  const [tax, setTax] = useState('0');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('Payment due within 14 days of issue. Thank you!');
  const [submitting, setSubmitting] = useState(false);
  const [createdInvoice, setCreatedInvoice] = useState<any>(null);

  // Line items state
  const [lineItems, setLineItems] = useState([
    { description: 'Retention Video Editing & Polish', quantity: 1, unitPrice: 900 },
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
        toast({ message: `Invoice ${res.invoice.invoiceNumber} generated!`, type: 'success' });
        setCreatedInvoice(res.invoice);
        if (onInvoiceCreated) onInvoiceCreated();
      }
    } catch (err: any) {
      toast({ message: err.message || 'Failed to generate invoice', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportPdfStub = async () => {
    if (!createdInvoice) return;
    try {
      const res = await apiFetch(`/api/admin/invoices/${createdInvoice._id}/pdf`);
      if (res.success && res.pdfData) {
        toast({ message: `PDF export ready for ${createdInvoice.invoiceNumber}`, type: 'success' });
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Automated Client Invoice & Statement Generator">
      {createdInvoice ? (
        <div style={{ display: 'grid', gap: '20px', padding: '10px 0' }}>
          <div
            style={{
              padding: '20px',
              backgroundColor: 'rgba(201, 160, 107, 0.1)',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--accent-gold)',
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>🎉</span>
            <h3 className="font-display" style={{ fontSize: '20px', color: 'var(--ink)', margin: 0 }}>
              Invoice Issued: {createdInvoice.invoiceNumber}
            </h3>
            <span style={{ fontSize: '13px', color: 'var(--accent-gold)', fontWeight: 700, display: 'block', marginTop: '4px' }}>
              Total Balance Due: {createdInvoice.totalAmount.toLocaleString()} {createdInvoice.currency}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={handleExportPdfStub} iconRight={IconExternalLink}>
              Export PDF Preview
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setCreatedInvoice(null);
                onClose();
              }}
              iconLeft={IconCheck}
            >
              Done
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleGenerateInvoice} style={{ display: 'grid', gap: '16px' }}>
          {/* Select Client */}
          <Select
            label="Client Account *"
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            options={[
              { value: '', label: '-- Select Client --' },
              ...clients.map((c) => ({ value: c._id, label: `${c.name} (${c.email})` })),
            ]}
          />

          {/* Optional Project / Contract Linkage */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Select
              label="Link Active Project (Optional)"
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                if (e.target.value) {
                  const found = projects.find((p) => p._id === e.target.value);
                  if (found) {
                    setInvoiceTitle(`Invoice for ${found.editingStyle}`);
                    setCurrency(found.currency || 'ETB');
                    setLineItems([{ description: `${found.editingStyle} Video Render`, quantity: 1, unitPrice: found.price || 0 }]);
                  }
                }
              }}
              options={[
                { value: '', label: '-- None (Custom) --' },
                ...projects.map((p) => ({ value: p._id, label: `${p.editingStyle} (${p.price} ${p.currency})` })),
              ]}
            />

            <Select
              label="Link Retainer Plan (Optional)"
              value={selectedContractId}
              onChange={(e) => {
                setSelectedContractId(e.target.value);
                if (e.target.value) {
                  const found = contracts.find((c) => c._id === e.target.value);
                  if (found) {
                    setInvoiceTitle(`Monthly Retainer (${found.frequency})`);
                    setCurrency(found.currency || 'ETB');
                    setLineItems([{ description: `Monthly Retainer Package`, quantity: 1, unitPrice: found.monthlyPrice || 0 }]);
                  }
                }
              }}
              options={[
                { value: '', label: '-- None (Custom) --' },
                ...contracts.map((c) => ({ value: c._id, label: `${c.frequency} (${c.monthlyPrice} ${c.currency})` })),
              ]}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
            <Input label="Invoice Title" value={invoiceTitle} onChange={(e) => setInvoiceTitle(e.target.value)} required />
            <Select
              label="Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as 'ETB' | 'USD')}
              options={[
                { value: 'ETB', label: 'ETB (Br)' },
                { value: 'USD', label: 'USD ($)' },
              ]}
            />
          </div>

          {/* Line Items Editor */}
          <div style={{ padding: '14px', backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 800 }}>
                BILLABLE LINE ITEMS:
              </span>
              <Button type="button" variant="secondary" size="small" iconLeft={IconPlus} onClick={handleAddLineItem}>
                Add Item
              </Button>
            </div>

            <div style={{ display: 'grid', gap: '10px' }}>
              {lineItems.map((item, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1.5fr auto', gap: '8px', alignItems: 'center' }}>
                  <Input
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity.toString()}
                    onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                  />
                  <Input
                    type="number"
                    placeholder="Rate"
                    value={item.unitPrice.toString()}
                    onChange={(e) => handleItemChange(idx, 'unitPrice', Number(e.target.value))}
                  />
                  {lineItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveLineItem(idx)}
                      style={{ color: '#E53E3E', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 800 }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Totals Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <Input label="Discount (-)" type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} />
            <Input label="Tax (+)" type="number" value={tax} onChange={(e) => setTax(e.target.value)} />
            <div style={{ padding: '8px 12px', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', textAlign: 'right' }}>
              <span className="font-mono" style={{ fontSize: '10px', color: 'var(--ink-soft)', display: 'block' }}>TOTAL AMOUNT</span>
              <span className="font-display" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-gold)' }}>
                {totalAmount.toLocaleString()} {currency}
              </span>
            </div>
          </div>

          <Textarea label="Invoice Notes / Payment Instructions" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" iconLeft={IconFileText} isLoading={submitting}>
              Issue Invoice
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
