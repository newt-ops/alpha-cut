import React, { useState } from 'react';
import { Button } from '@components/ui/Button';
import { Input, Textarea } from '@components/ui/Input';
import { Checkbox, Radio } from '@components/ui/Checkbox';
import { Switch } from '@components/ui/Switch';
import { Select } from '@components/ui/Select';
import { Modal } from '@components/ui/Modal';
import { useToast } from '@components/ui/Toast';
import { Tooltip } from '@components/ui/Tooltip';
import { Tabs } from '@components/ui/Tabs';
import { Accordion } from '@components/ui/Accordion';
import { Stepper } from '@components/ui/Stepper';
import { StarRating } from '@components/ui/StarRating';
import { CurrencyToggle } from '@components/ui/CurrencyToggle';
import { Dropzone } from '@components/ui/Dropzone';
import { Badge } from '@components/ui/Badge';
import { Pagination } from '@components/ui/Pagination';
import { Skeleton } from '@components/ui/Skeleton';
import { IconSparkles, IconPlay, IconFilm, IconCheck } from '@icons/icons';

export const DevComponentsPage = () => {
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [checked, setChecked] = useState(true);
  const [radioVal, setRadioVal] = useState('a');
  const [switchVal, setSwitchVal] = useState(true);
  const [selectVal, setSelectVal] = useState('viral');
  const [activeTab, setActiveTab] = useState('overview');
  const [rating, setRating] = useState(4);
  const [currency, setCurrency] = useState('ETB');
  const [currentPage, setCurrentPage] = useState(1);

  const selectOptions = [
    { label: 'Viral Animation Breakdown', value: 'viral' },
    { label: 'Cinematic Short-Film', value: 'cinematic' },
    { label: 'SaaS & App Showcase', value: 'saas' },
  ];

  const tabOptions = [
    { id: 'overview', label: 'Overview' },
    { id: 'features', label: 'Features' },
    { id: 'pricing', label: 'Pricing' },
  ];

  const accordionItems = [
    { title: 'What is the delivery turnaround time?', content: 'Our standard turnaround for short-form videos is 24-48 hours per video batch.' },
    { title: 'How do revisions work?', content: 'Every package includes unlimited structural and text revisions within 7 days of delivery.' },
  ];

  const stepperSteps = [
    { label: 'Proposal Sent' },
    { label: 'Accepted' },
    { label: 'In Progress' },
    { label: 'Delivered' },
    { label: 'Completed' },
  ];

  return (
    <div style={{ padding: '40px 0', width: '100%' }}>
      <div style={{ marginBottom: '40px' }}>
        <Badge variant="gold">Dev QA Sandbox</Badge>
        <h1 className="font-display" style={{ fontSize: '32px', marginTop: '12px' }}>
          Core UI Component Library
        </h1>
        <p style={{ color: 'var(--ink-soft)', marginTop: '4px' }}>
          Isolated component verification for light and dark mode compliance.
        </p>
      </div>

      <div style={{ display: 'grid', gap: '32px' }}>
        {/* Buttons */}
        <section style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)' }}>
          <h3 className="font-display" style={{ marginBottom: '16px' }}>1. Buttons</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            <Button variant="primary" iconLeft={IconSparkles}>Primary Gold</Button>
            <Button variant="secondary" iconRight={IconPlay}>Secondary Outlined</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="primary" isLoading>Loading State</Button>
            <Button variant="secondary" isDisabled>Disabled</Button>
          </div>
        </section>

        {/* Inputs & Textareas */}
        <section style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)' }}>
          <h3 className="font-display" style={{ marginBottom: '16px' }}>2. Inputs & Textareas</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <Input label="Client Name" placeholder="Enter name" icon={IconFilm} />
            <Input label="Email Address" placeholder="client@example.com" error="Email address is required" />
            <Textarea label="Project Brief" placeholder="Describe video requirements..." />
          </div>
        </section>

        {/* Checkbox, Radio, Switch, Select */}
        <section style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)' }}>
          <h3 className="font-display" style={{ marginBottom: '16px' }}>3. Form Controls & Select</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', alignItems: 'center' }}>
            <Checkbox checked={checked} onChange={setChecked} label="Include 4K Export" />
            <div style={{ display: 'flex', gap: '16px' }}>
              <Radio checked={radioVal === 'a'} onChange={() => setRadioVal('a')} label="Option A" />
              <Radio checked={radioVal === 'b'} onChange={() => setRadioVal('b')} label="Option B" />
            </div>
            <Switch checked={switchVal} onChange={setSwitchVal} label="Enable Notifications" />
          </div>
          <div style={{ marginTop: '20px', maxWidth: '340px' }}>
            <Select label="Editing Style Category" options={selectOptions} value={selectVal} onChange={setSelectVal} />
          </div>
        </section>

        {/* Modal, Toast, Tooltip */}
        <section style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)' }}>
          <h3 className="font-display" style={{ marginBottom: '16px' }}>4. Modal, Toast & Tooltip</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
            <Button variant="secondary" onClick={() => setModalOpen(true)}>Open Modal</Button>
            <Button variant="primary" onClick={() => toast({ message: 'Proposal created successfully!', type: 'success' })}>
              Trigger Toast
            </Button>
            <Tooltip content="Custom theme-aware hover tooltip">
              <span style={{ fontSize: '14px', textDecoration: 'underline', color: 'var(--accent-gold)', cursor: 'pointer' }}>
                Hover for Tooltip
              </span>
            </Tooltip>
          </div>

          <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Project Confirmation">
            <p style={{ color: 'var(--ink-soft)', lineHeight: 1.6 }}>
              Are you sure you want to approve the video delivery for this project?
            </p>
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={() => setModalOpen(false)}>Approve Delivery</Button>
            </div>
          </Modal>
        </section>

        {/* Tabs, Accordion, Stepper, Currency Toggle */}
        <section style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)' }}>
          <h3 className="font-display" style={{ marginBottom: '16px' }}>5. Navigation & Status Indicators</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center', marginBottom: '24px' }}>
            <Tabs tabs={tabOptions} activeTab={activeTab} onChange={setActiveTab} />
            <CurrencyToggle currency={currency} onChange={setCurrency} />
            <StarRating rating={rating} onChange={setRating} readOnly={false} />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--ink-soft)' }}>Project Status Stepper:</h4>
            <Stepper steps={stepperSteps} currentStep={2} />
          </div>

          <Accordion items={accordionItems} />
        </section>

        {/* Dropzone, Badges, Pagination, Skeleton */}
        <section style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)' }}>
          <h3 className="font-display" style={{ marginBottom: '16px' }}>6. Upload Dropzone, Badges, Pagination & Skeleton</h3>
          <div style={{ marginBottom: '24px' }}>
            <Dropzone />
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px', alignItems: 'center' }}>
            <Badge variant="gold">Viral Animation</Badge>
            <Badge variant="maroon">Short-Form</Badge>
            <Badge variant="success">Completed</Badge>
            <Badge variant="surface">USD / ETB</Badge>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
            <Pagination currentPage={currentPage} totalPages={5} onPageChange={setCurrentPage} />
            <div style={{ display: 'flex', gap: '12px', width: '200px' }}>
              <Skeleton width="40px" height="40px" borderRadius="50%" />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Skeleton width="100%" height="16px" />
                <Skeleton width="60%" height="12px" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
