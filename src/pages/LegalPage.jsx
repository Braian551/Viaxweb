import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import LegalView from '../components/LegalView';
import SeoMeta from '../components/SeoMeta';

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

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: 'https://viaxcol.online/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Legal',
        item: `https://viaxcol.online/legal?doc=${doc}&role=${role}`,
      },
    ],
  };

  return (
    <div className="page-shell">
      <SeoMeta
        title="Términos y privacidad"
        description="Consulta los términos y condiciones y la política de privacidad de Viax por rol: cliente, conductor, empresa, administrador y servidor."
        path={`/legal?doc=${doc}&role=${role}`}
        keywords="terminos y condiciones viax, politica de privacidad viax, legal"
        jsonLd={breadcrumbJsonLd}
      />
      <LegalView
        role={role}
        doc={doc}
        onRoleChange={handleRoleChange}
        onDocChange={handleDocChange}
      />
    </div>
  );
}
