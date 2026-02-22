import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import LegalView from '../components/LegalView';

const VALID_ROLES = ['cliente', 'conductor', 'empresa', 'administrador', 'servidor'];
const VALID_DOCS = ['terms', 'privacy'];

export default function LegalPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const role = useMemo(() => {
    const raw = searchParams.get('role');
    return VALID_ROLES.includes(raw) ? raw : 'cliente';
  }, [searchParams]);

  const doc = useMemo(() => {
    const raw = searchParams.get('doc');
    return VALID_DOCS.includes(raw) ? raw : 'terms';
  }, [searchParams]);

  const handleRoleChange = (value) => {
    setSearchParams({ role: value, doc });
  };

  const handleDocChange = (value) => {
    setSearchParams({ role, doc: value });
  };

  return (
    <div className="page-shell">
      <LegalView
        role={role}
        doc={doc}
        onRoleChange={handleRoleChange}
        onDocChange={handleDocChange}
      />
    </div>
  );
}
