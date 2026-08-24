import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sidebar } from './Sidebar';
import { HeaderBar } from './HeaderBar';
import { CasillaPopover } from '../common/CasillaPopover';
import { ConfirmModal } from '../common/ConfirmModal';
import { ToastContainer } from '../common/ToastContainer';

// Modules
import { CalendarioModule } from '../modules/CalendarioModule';
import { PersonaNaturalModule } from '../modules/PersonaNaturalModule';
import { PersonaJuridicaModule } from '../modules/PersonaJuridicaModule';
import { RegimenSimpleModule } from '../modules/RegimenSimpleModule';
import { IvaModule } from '../modules/IvaModule';
import { RetefuenteModule } from '../modules/RetefuenteModule';
import { BeneficiosModule } from '../modules/BeneficiosModule';
import { PresentacionSancionesModule } from '../modules/PresentacionSancionesModule';
import { ComponenteInflacionarioModule } from '../modules/ComponenteInflacionarioModule';
import { ReajusteArt73Module } from '../modules/ReajusteArt73Module';
import { InmueblesAfcModule } from '../modules/InmueblesAfcModule';
import { TributacionParejaModule } from '../modules/TributacionParejaModule';
import { GlosarioBasicoModule } from '../modules/GlosarioBasicoModule';
import { RulesInspectorModule } from '../modules/RulesInspectorModule';

export const AppShell: React.FC = () => {
  const { activeModule, isSidebarCollapsed } = useApp();

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'calendario':
        return <CalendarioModule />;
      case 'pn':
        return <PersonaNaturalModule />;
      case 'pj':
        return <PersonaJuridicaModule />;
      case 'simple':
        return <RegimenSimpleModule />;
      case 'iva':
        return <IvaModule />;
      case 'retefuente':
        return <RetefuenteModule />;
      case 'beneficios':
        return <BeneficiosModule />;
      case 'presentacion':
        return <PresentacionSancionesModule />;
      case 'inflacionario':
        return <ComponenteInflacionarioModule />;
      case 'art73':
        return <ReajusteArt73Module />;
      case 'inmuebles-afc':
        return <InmueblesAfcModule />;
      case 'tributacion-pareja':
        return <TributacionParejaModule />;
      case 'glosario':
        return <GlosarioBasicoModule />;
      case 'rules':
        return <RulesInspectorModule />;
      default:
        return <PersonaNaturalModule />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar />

      <main className={`workspace ${isSidebarCollapsed ? 'expanded' : ''}`} id="app-workspace">
        <HeaderBar />

        <div className="workspace-body">{renderActiveModule()}</div>
      </main>

      <CasillaPopover />
      <ConfirmModal />
      <ToastContainer />
    </div>
  );
};
