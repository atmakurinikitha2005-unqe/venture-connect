import { LoginComponent } from './features/auth/login.component';
import { AdminComponent } from './features/admin/admin.component';
import { EntrepreneurComponent } from './features/entrepreneur/entrepreneur.component';
import { VcDiscoverComponent } from './features/vc/discover.component';
import { VcCompareComponent } from './features/vc/compare.component';
import { VcPipelineComponent } from './features/vc/pipeline.component';
import { VcDueDiligenceComponent } from './features/vc/due-diligence.component';
import { VcProposalsMeetingsComponent } from './features/vc/proposals-meetings.component';
import { VcPortfolioComponent } from './features/vc/portfolio.component';
import { VcGraphViewComponent } from './features/vc/graph-view.component';

export const routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'entrepreneur', component: EntrepreneurComponent },
  { path: 'vc/discover', component: VcDiscoverComponent },
  { path: 'vc/compare', component: VcCompareComponent },
  { path: 'vc/pipeline', component: VcPipelineComponent },
  { path: 'vc/due-diligence', component: VcDueDiligenceComponent },
  { path: 'vc/proposals', component: VcProposalsMeetingsComponent },
  { path: 'vc/portfolio', component: VcPortfolioComponent },
  { path: 'vc/graph', component: VcGraphViewComponent },
  { path: '**', redirectTo: '/login' }
];
