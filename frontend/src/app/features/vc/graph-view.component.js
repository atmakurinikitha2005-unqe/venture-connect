import { Component, ElementRef, ViewChild, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-vc-graph-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid py-4" style="background-color: #0b0f19; min-height: 100vh; color: #e2e8f0;">
      
      <!-- Header Banner -->
      <div class="p-4 mb-4 rounded-4 text-white shadow-lg border border-info border-opacity-25" style="background: linear-gradient(135deg, #0d1b2a 0%, #1b263b 100%);">
        <div class="row align-items-center">
          <div class="col-md-7">
            <span class="badge bg-info text-dark fw-bold mb-2"><i class="bi bi-diagram-3-fill me-1"></i>CognoDB openCypher Graph Engine</span>
            <h2 class="fw-bold mb-2 text-white">Full 4-Entity Graph &amp; Financial Growth Simulator</h2>
            <p class="mb-0 text-white-50 fs-6">
              Displaying connected graph relationships between 🛡️ <strong>Admin</strong>, 💼 <strong>VC Investors</strong>, 🚀 <strong>Entrepreneurs</strong>, and 💡 <strong>Startup Ideas</strong> over Bolt &amp; openCypher.
            </p>
          </div>
          <div class="col-md-5 text-md-end mt-3 mt-md-0">
            <!-- View Mode Switcher -->
            <div class="btn-group shadow-sm bg-dark p-1 rounded-3 border border-secondary border-opacity-50">
              <button class="btn btn-sm" [class.btn-info]="viewMode === 'tree'" [class.text-dark]="viewMode === 'tree'" [class.btn-dark]="viewMode !== 'tree'" (click)="setMode('tree')">
                <i class="bi bi-diagram-2-fill me-1"></i>🌲 Tree Format
              </button>
              <button class="btn btn-sm" [class.btn-info]="viewMode === 'network'" [class.text-dark]="viewMode === 'network'" [class.btn-dark]="viewMode !== 'network'" (click)="setMode('network')">
                <i class="bi bi-globe2 me-1"></i>🕸️ Network Graph
              </button>
              <button class="btn btn-sm" [class.btn-info]="viewMode === 'cards'" [class.text-dark]="viewMode === 'cards'" [class.btn-dark]="viewMode !== 'cards'" (click)="setMode('cards')">
                <i class="bi bi-grid-3x3-gap-fill me-1"></i>🎴 Cards View
              </button>
            </div>
            <button class="btn btn-sm btn-outline-info text-info fw-bold ms-2 mt-2 mt-sm-0" (click)="loadNetworkGraph()">
              <i class="bi bi-arrow-clockwise me-1"></i>Refresh Data
            </button>
          </div>
        </div>
      </div>

      <!-- UNIQUE INNOVATION: FINANCIAL GROWTH STAGE & PERCENTAGE SIMULATOR -->
      <div class="card border border-warning border-opacity-40 rounded-4 p-4 mb-4 shadow-lg" style="background: linear-gradient(135deg, #181406 0%, #0d1322 100%);">
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
          <div class="d-flex align-items-center">
            <span class="badge bg-warning text-dark font-monospace fs-7 me-3 px-3 py-2"><i class="bi bi-graph-up-arrow me-1"></i>FINANCIAL GROWTH SIMULATOR</span>
            <div>
              <h5 class="fw-bold mb-0 text-white">📈 Financial Growth &amp; Percentage Simulator</h5>
              <span class="fs-8 text-warning-subtle">Drag the slider to simulate financial valuation growth &amp; percentage expansion metrics!</span>
            </div>
          </div>
          <div class="d-flex align-items-center gap-2">
            <span class="badge bg-success text-dark font-monospace fs-6 px-3 py-2 fw-bold">
              <i class="bi bi-arrow-up-right me-1"></i>{{ currentMilestone.growth_percentage }} Financial Growth
            </span>
            <div class="badge bg-dark border border-warning text-warning fs-6 px-3 py-2 font-monospace">
              Active Stage: {{ currentMilestone.label }}
            </div>
          </div>
        </div>

        <!-- Interactive Growth Slider Bar with Percentage Display -->
        <div class="row align-items-center g-3">
          <div class="col-md-9">
            <input type="range" class="form-range custom-range" min="0" max="3" step="1" [(ngModel)]="timelineIndex" (change)="onTimelineChange()">
            <div class="d-flex justify-content-between fs-8 font-monospace text-secondary">
              <span [class.text-warning]="timelineIndex == 0" [class.fw-bold]="timelineIndex == 0">🌱 Seed Round ($1.5M • <strong>+0%</strong>)</span>
              <span [class.text-warning]="timelineIndex == 1" [class.fw-bold]="timelineIndex == 1">🚀 Series A ($5.0M • <strong>+250%</strong>)</span>
              <span [class.text-warning]="timelineIndex == 2" [class.fw-bold]="timelineIndex == 2">📈 Series B ($15M • <strong>+550%</strong>)</span>
              <span [class.text-warning]="timelineIndex == 3" [class.fw-bold]="timelineIndex == 3">🦄 Unicorn Exit ($50M+ • <strong>+900%</strong>)</span>
            </div>
          </div>
          <div class="col-md-3 text-md-end">
            <button class="btn btn-sm btn-warning text-dark fw-bold w-100 py-2 shadow-sm" (click)="playTimelineSimulation()">
              <i class="bi bi-play-circle-fill me-1"></i>{{ isSimulating ? 'Simulating Financial Growth...' : 'Play Growth Simulation' }}
            </button>
          </div>
        </div>
      </div>

      <!-- STARTUP IDEA SELECTOR BAR -->
      <div class="card border border-info border-opacity-25 rounded-4 p-3 mb-4 shadow-lg" style="background: #0d1322;">
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div class="d-flex align-items-center">
            <i class="bi bi-lightbulb-fill text-warning fs-4 me-3"></i>
            <div>
              <h6 class="fw-bold mb-0 text-white">Select Startup Idea to Focus 4-Entity Graph:</h6>
              <span class="fs-8 text-secondary">Click any startup idea below to see its exact 4-entity connections (Admin 🛡️ + VC 💼 + Entrepreneur 🚀 + Startup 💡)</span>
            </div>
          </div>
          <div class="d-flex flex-wrap gap-2">
            <button class="btn btn-sm fw-bold px-3 py-1.5" 
                    [class.btn-info]="selectedStartupId === 'all'" 
                    [class.text-dark]="selectedStartupId === 'all'" 
                    [class.btn-outline-secondary]="selectedStartupId !== 'all'"
                    (click)="selectStartupFocus('all')">
              🌐 Full Network (All Startups)
            </button>
            <button *ngFor="let st of availableStartups" 
                    class="btn btn-sm fw-bold px-3 py-1.5" 
                    [class.btn-success]="selectedStartupId === st.id" 
                    [class.btn-outline-info]="selectedStartupId !== st.id"
                    (click)="selectStartupFocus(st.id)">
              🚀 {{ st.name }} <span class="badge bg-dark text-info ms-1 fs-8">{{ st.industry }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Active Focus Banner -->
      <div *ngIf="selectedStartup" class="alert alert-info bg-dark border-info text-info rounded-4 p-3 mb-4 shadow-sm d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center">
          <span class="badge bg-success me-3 fs-7">:Startup 4-Entity Graph Active</span>
          <div>
            <h5 class="fw-bold mb-0 text-white">{{ selectedStartup.name }}</h5>
            <span class="fs-8 text-info">Connected to 🛡️ System Admin + 💼 VC Investor + 🚀 Founder ({{ selectedStartup.founder_name || 'Sarah Chen' }}) + 💡 {{ selectedStartup.name }}</span>
          </div>
        </div>
        <button class="btn btn-sm btn-outline-info" (click)="selectStartupFocus('all')">Show Full Network</button>
      </div>

      <!-- 1. TREE HIERARCHY FORMAT VIEW -->
      <div *ngIf="viewMode === 'tree'" class="row g-4 mb-4">
        <div class="col-12">
          <div class="card border border-info border-opacity-25 rounded-4 shadow-lg" style="background: #0d1322;">
            <div class="card-header bg-dark text-white d-flex justify-content-between align-items-center py-3 border-bottom border-secondary border-opacity-25">
              <span class="fw-bold fs-6 text-info"><i class="bi bi-diagram-2 me-2"></i>4-Entity Tree Hierarchy (Admin &rarr; VC &rarr; Startup &rarr; Entrepreneur)</span>
              <span class="badge bg-info text-dark font-monospace fs-8">{{ filteredTreeNodes.length }} Hierarchy Branches</span>
            </div>

            <div class="card-body p-4">
              <!-- Root Level Admin & VC Trees -->
              <div class="row g-4">
                <div *ngFor="let tree of filteredTreeNodes" class="col-md-6 col-lg-4">
                  <div class="p-3 rounded-4 border border-secondary border-opacity-50" style="background: #111827;">
                    
                    <!-- Root Node: Admin or VC -->
                    <div class="d-flex align-items-center mb-3 p-2 rounded-3" [style.border-left]="tree.label === 'Admin' ? '4px solid #ffc107' : '4px solid #0d6efd'" [style.background]="tree.label === 'Admin' ? 'rgba(255, 193, 7, 0.15)' : 'rgba(13, 110, 253, 0.15)'">
                      <span class="badge me-2" [class.bg-warning]="tree.label === 'Admin'" [class.text-dark]="tree.label === 'Admin'" [class.bg-primary]="tree.label !== 'Admin'">
                        ROOT: :{{ tree.label }}
                      </span>
                      <div>
                        <h6 class="fw-bold mb-0 text-white">{{ tree.name }}</h6>
                        <span class="fs-8 text-secondary">{{ tree.firm || tree.id }}</span>
                      </div>
                    </div>

                    <!-- Tree Branch Lines -->
                    <div class="ms-3 ps-3 border-start border-secondary border-opacity-50">
                      <div class="text-info fs-8 fw-semibold mb-2 font-monospace">└── :CONNECTED_RELATIONSHIP (Sub-Branches)</div>

                      <!-- Level 2 Nodes: Startups -->
                      <div *ngFor="let child of tree.children" class="mb-3">
                        <div class="d-flex align-items-center p-2 rounded-3 mb-2" style="background: rgba(25, 135, 84, 0.15); border-left: 3px solid #198754;">
                          <span class="badge bg-success me-2">:Startup</span>
                          <div>
                            <h6 class="fw-bold mb-0 text-white fs-7">{{ child.name }}</h6>
                            <span class="fs-8 text-white-50">{{ child.industry }} • {{ child.stage || 'Seed' }}</span>
                          </div>
                        </div>

                        <!-- Level 3 Nodes: Founders -->
                        <div class="ms-3 ps-3 border-start border-secondary border-opacity-25">
                          <div class="text-warning fs-8 font-monospace">└── :FOUNDED</div>
                          <div *ngFor="let founder of child.founders" class="d-flex align-items-center p-1.5 rounded-2 mt-1" style="background: rgba(156, 39, 176, 0.15); border-left: 2px solid #9c27b0;">
                            <span class="badge bg-purple text-white me-2 fs-8">:Entrepreneur</span>
                            <span class="fs-8 text-white fw-medium">{{ founder.name }}</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. CONNECTING POINTS GLOWING CANVAS GRAPH VIEW -->
      <div *ngIf="viewMode === 'network'" class="card border border-info border-opacity-25 rounded-4 overflow-hidden shadow-lg position-relative mb-4" style="background: #090d16;">
        <div class="card-header bg-dark text-white d-flex justify-content-between align-items-center py-3 border-bottom border-secondary border-opacity-25">
          <span class="fw-bold fs-6 text-info"><i class="bi bi-diagram-3 me-2"></i>Interactive 4-Entity Graph (Admin 🛡️ • VC 💼 • Entrepreneur 🚀 • Startup 💡)</span>
          <span class="badge bg-info text-dark font-monospace fs-8">{{ activeDisplayNodes.length }} Nodes • {{ activeDisplayEdges.length }} Edges</span>
        </div>

        <div class="position-relative">
          <canvas #graphCanvas class="w-100" style="height: 580px; cursor: grab;" 
                  (mousedown)="onCanvasMouseDown($event)" 
                  (mousemove)="onCanvasMouseMove($event)" 
                  (mouseup)="onCanvasMouseUp()"></canvas>

          <!-- Floating Cypher Query Console -->
          <div class="position-absolute bottom-0 start-0 m-3 p-3 rounded-4 border border-info border-opacity-40 shadow-lg" 
               style="background: rgba(13, 17, 26, 0.92); backdrop-filter: blur(10px); width: 440px; z-index: 10;">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="badge bg-info text-dark font-monospace fs-8"><i class="bi bi-terminal-fill me-1"></i>CYPHER CONSOLE</span>
              <span class="fs-8 text-info font-monospace">{{ lastResponse?.execution_time_ms || 1.4 }} ms</span>
            </div>

            <div class="input-group">
              <input type="text" class="form-control form-control-sm bg-dark text-info border-secondary font-monospace fs-7" 
                     [(ngModel)]="cypherQuery" 
                     (keyup.enter)="executeQuery()"
                     placeholder="MATCH (n)-[r]->(m) RETURN n, r, m">
              <button class="btn btn-sm btn-info fw-bold px-3" (click)="executeQuery()" [disabled]="loading">
                <span *ngIf="loading" class="spinner-border spinner-border-sm me-1"></span>
                Run
              </button>
            </div>
          </div>

          <!-- Node Details Overlay -->
          <div *ngIf="selectedNode" class="position-absolute top-0 end-0 m-3 p-3 rounded-3 border border-info border-opacity-50 shadow-lg text-white" 
               style="background: rgba(11, 15, 25, 0.92); backdrop-filter: blur(8px); width: 280px; z-index: 10;">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="badge bg-info text-dark font-monospace fw-bold">:{{ selectedNode.label }}</span>
              <button class="btn-close btn-close-white btn-sm" (click)="selectedNode = null"></button>
            </div>
            <h6 class="fw-bold text-info mb-1">{{ selectedNode.title }}</h6>
            <div class="fs-8 text-secondary mb-2">ID: <code>{{ selectedNode.id }}</code></div>
            <pre class="bg-dark p-2 rounded border border-secondary text-info fs-8 mb-0" style="max-height: 140px; overflow-y: auto;">{{ selectedNode.properties | json }}</pre>
          </div>
        </div>
      </div>

      <!-- 3. CARDS GRID FORMAT VIEW -->
      <div *ngIf="viewMode === 'cards'" class="row g-4 mb-4">
        <div class="col-lg-6">
          <div class="card border-0 shadow-sm rounded-4 text-dark" style="background: #ffffff;">
            <div class="card-header bg-white py-3 fw-bold border-bottom">
              <i class="bi bi-circle-fill text-primary me-2"></i>Graph Nodes ({{ filteredRawNodes.length }})
            </div>
            <div class="card-body p-3">
              <div class="row g-3">
                <div *ngFor="let node of filteredRawNodes" class="col-md-6">
                  <div class="p-3 rounded-3 border" [ngClass]="{
                    'bg-warning-subtle border-warning-subtle': node.label === 'Admin',
                    'bg-primary-subtle border-primary-subtle': node.label === 'VC',
                    'bg-success-subtle border-success-subtle': node.label === 'Startup',
                    'bg-info-subtle border-info-subtle': node.label === 'Entrepreneur'
                  }">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                      <span class="badge" [ngClass]="{
                        'bg-warning text-dark': node.label === 'Admin',
                        'bg-primary': node.label === 'VC',
                        'bg-success': node.label === 'Startup',
                        'bg-info text-dark': node.label === 'Entrepreneur'
                      }">:{{ node.label }}</span>
                      <span class="fs-8 text-muted">ID: {{ node.id }}</span>
                    </div>
                    <h6 class="fw-bold mb-0 text-dark">{{ node.properties?.name || node.title }}</h6>
                    <span class="fs-8 text-muted">{{ node.properties?.firm || node.properties?.industry || '' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-6">
          <div class="card border-0 shadow-sm rounded-4 text-dark" style="background: #ffffff;">
            <div class="card-header bg-white py-3 fw-bold border-bottom">
              <i class="bi bi-arrow-right-circle-fill text-danger me-2"></i>Graph Typed Relationships ({{ filteredRawEdges.length }})
            </div>
            <div class="card-body p-3" style="max-height: 420px; overflow-y: auto;">
              <div *ngFor="let edge of filteredRawEdges" class="p-3 rounded-3 border mb-2 bg-light d-flex align-items-center justify-content-between">
                <span class="badge bg-secondary px-2 py-1">{{ edge.source }}</span>
                <div class="text-center">
                  <span class="badge bg-danger px-2 py-1">&rarr; :{{ edge.type }}</span>
                </div>
                <span class="badge bg-secondary px-2 py-1">{{ edge.target }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  `
})
export class VcGraphViewComponent {
  @ViewChild('graphCanvas') canvasRef;

  apiService = inject(ApiService);
  ngZone = inject(NgZone);

  cypherQuery = `MATCH (n)-[r]->(m) RETURN n, r, m`;
  viewMode = 'tree';

  // Financial Growth Simulator State with Explicit Growth Percentages
  timelineIndex = 0;
  isSimulating = false;
  milestones = [
    { stage: 'Seed Round', growth_percentage: '+0%', label: 'Seed Round ($1.5M Raised • $10M Val • +0% Growth)' },
    { stage: 'Series A', growth_percentage: '+250%', label: 'Series A Expansion ($5.0M Raised • $35M Val • +250% Growth)' },
    { stage: 'Series B', growth_percentage: '+550%', label: 'Series B Syndicate ($15.0M Raised • $65M Val • +550% Growth)' },
    { stage: 'Unicorn IPO', growth_percentage: '+900%', label: 'Unicorn Exit ($50.0M+ Raised • $100M+ Val • +900% Growth)' }
  ];
  currentMilestone = this.milestones[0];

  availableStartups = [];
  selectedStartupId = 'all';
  selectedStartup = null;

  nodes = [];
  edges = [];
  rawNodes = [];
  rawEdges = [];

  activeDisplayNodes = [];
  activeDisplayEdges = [];

  treeNodes = [];
  filteredTreeNodes = [];
  filteredRawNodes = [];
  filteredRawEdges = [];
  selectedNode = null;
  lastResponse = null;
  loading = false;

  ctx = null;
  isDragging = false;
  draggedNode = null;

  ngOnInit() {
    this.loadStartupsList();
    this.loadNetworkGraph();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initCanvas();
      if (this.viewMode === 'network') {
        this.renderGraph();
      }
    }, 100);
  }

  onTimelineChange() {
    this.currentMilestone = this.milestones[this.timelineIndex];
    this.applyFilters();
  }

  playTimelineSimulation() {
    if (this.isSimulating) return;
    this.isSimulating = true;
    this.timelineIndex = 0;
    this.onTimelineChange();

    const timer = setInterval(() => {
      if (this.timelineIndex < 3) {
        this.timelineIndex++;
        this.onTimelineChange();
      } else {
        clearInterval(timer);
        this.isSimulating = false;
      }
    }, 1400);
  }

  loadStartupsList() {
    this.apiService.get('/vc/discover').subscribe({
      next: (res) => {
        this.availableStartups = res || [];
      }
    });
  }

  selectStartupFocus(startupId) {
    this.selectedStartupId = startupId;
    if (startupId === 'all') {
      this.selectedStartup = null;
    } else {
      this.selectedStartup = this.availableStartups.find(s => s.id === startupId) || null;
    }

    this.applyFilters();
  }

  applyFilters() {
    let baseEdges = [...this.rawEdges];
    let baseNodes = [...this.nodes];

    // Modify nodes radius and financial growth percentage properties
    const multiplier = 1 + (this.timelineIndex * 0.35);
    baseNodes = baseNodes.map(n => {
      if (n.label === 'Startup') {
        return {
          ...n,
          radius: Math.min(38, Math.floor(16 * multiplier)),
          properties: {
            ...n.properties,
            financial_stage: this.currentMilestone.stage,
            growth_percentage: this.currentMilestone.growth_percentage,
            simulated_valuation: `$${(10 * multiplier).toFixed(1)}M`
          }
        };
      }
      return n;
    });

    if (this.selectedStartupId === 'all') {
      this.filteredTreeNodes = this.treeNodes;
      this.filteredRawNodes = this.rawNodes;
      this.filteredRawEdges = baseEdges;
      this.activeDisplayNodes = baseNodes;
      this.activeDisplayEdges = baseEdges;
    } else {
      const stId = this.selectedStartupId;

      const directEdges = baseEdges.filter(e => e.source === stId || e.target === stId);
      const connectedNodeIds = new Set([stId]);
      
      directEdges.forEach(e => {
        connectedNodeIds.add(e.source);
        connectedNodeIds.add(e.target);
      });

      const adminNode = this.rawNodes.find(n => n.label === 'Admin');
      const vcNode = this.rawNodes.find(n => n.label === 'VC');
      const entNode = this.rawNodes.find(n => n.label === 'Entrepreneur');
      const stNode = this.rawNodes.find(n => n.id === stId);

      if (adminNode) connectedNodeIds.add(adminNode.id);
      if (vcNode) connectedNodeIds.add(vcNode.id);
      if (entNode) connectedNodeIds.add(entNode.id);
      if (stNode) connectedNodeIds.add(stNode.id);

      const fourEntityEdges = [
        ...directEdges,
        { source: 'usr_admin', target: stId, type: 'VERIFIED_AND_APPROVED' },
        { source: 'usr_vc1', target: stId, type: 'INVESTED_IN' },
        { source: 'usr_ent1', target: stId, type: 'FOUNDED' },
        { source: 'usr_admin', target: 'usr_ent1', type: 'MANAGES_USER_ACCOUNT' }
      ];

      this.filteredRawNodes = this.rawNodes.filter(n => connectedNodeIds.has(n.id));
      this.filteredRawEdges = fourEntityEdges;

      this.activeDisplayNodes = baseNodes.filter(n => connectedNodeIds.has(n.id));
      this.activeDisplayEdges = fourEntityEdges.map(e => ({ source: e.source, target: e.target, type: e.type }));

      this.filteredTreeNodes = this.treeNodes.map(tree => {
        const matchingChildren = tree.children.filter(c => c.id === stId);
        return {
          ...tree,
          children: matchingChildren
        };
      }).filter(tree => tree.children.length > 0);

      const targetNode = baseNodes.find(n => n.id === stId);
      if (targetNode) {
        this.selectedNode = targetNode;
      }
    }

    if (this.viewMode === 'network') {
      this.renderGraph();
    }
  }

  setMode(mode) {
    this.ngZone.run(() => {
      this.viewMode = mode;
      if (mode === 'network') {
        setTimeout(() => {
          this.initCanvas();
          this.renderGraph();
        }, 100);
      }
    });
  }

  getDefaultNodes() {
    return [
      { id: 'usr_admin', label: 'Admin', properties: { name: 'System Admin', firm: 'VentureConnect HQ' } },
      { id: 'usr_vc1', label: 'VC', properties: { name: 'David Miller', firm: 'Horizon Capital ($250M AUM)' } },
      { id: 'usr_vc2', label: 'VC', properties: { name: 'Elena Rostova', firm: 'Apex Ventures ($180M AUM)' } },
      { id: 'usr_vc3', label: 'VC', properties: { name: 'Michael Chang', firm: 'Sequoia Next' } },
      { id: 'stp_1', label: 'Startup', properties: { name: 'NovaPay Tech', industry: 'FinTech', stage: 'Seed' } },
      { id: 'stp_2', label: 'Startup', properties: { name: 'HealthPulse AI', industry: 'HealthTech', stage: 'Series A' } },
      { id: 'stp_3', label: 'Startup', properties: { name: 'CleanGrid Tech', industry: 'CleanTech', stage: 'Seed' } },
      { id: 'usr_ent1', label: 'Entrepreneur', properties: { name: 'Sarah Chen' } },
      { id: 'usr_ent2', label: 'Entrepreneur', properties: { name: 'Dr. Alex Rivera' } },
      { id: 'usr_ent3', label: 'Entrepreneur', properties: { name: 'Marcus Vance' } }
    ];
  }

  getDefaultEdges() {
    return [
      { source: 'usr_admin', target: 'stp_1', type: 'VERIFIED_AND_APPROVED' },
      { source: 'usr_admin', target: 'stp_2', type: 'VERIFIED_AND_APPROVED' },
      { source: 'usr_admin', target: 'stp_3', type: 'VERIFIED_AND_APPROVED' },
      { source: 'usr_admin', target: 'usr_ent1', type: 'MANAGES_USER_ACCOUNT' },
      { source: 'usr_admin', target: 'usr_vc1', type: 'MANAGES_USER_ACCOUNT' },

      { source: 'usr_vc1', target: 'stp_1', type: 'INVESTED_IN' },
      { source: 'usr_vc1', target: 'stp_2', type: 'CO_INVESTED_WITH' },
      { source: 'usr_vc1', target: 'stp_3', type: 'EVALUATED' },
      { source: 'usr_vc1', target: 'usr_vc3', type: 'SYNDICATE_PARTNER' },
      
      { source: 'usr_vc2', target: 'stp_2', type: 'INVESTED_IN' },
      { source: 'usr_vc2', target: 'stp_3', type: 'INVESTED_IN' },
      { source: 'usr_vc2', target: 'usr_ent2', type: 'ADVISED_BY' },

      { source: 'usr_vc3', target: 'stp_1', type: 'INVESTED_IN' },
      { source: 'usr_vc3', target: 'usr_ent1', type: 'MENTORED' },

      { source: 'usr_ent1', target: 'stp_1', type: 'FOUNDED' },
      { source: 'usr_ent2', target: 'stp_2', type: 'FOUNDED' },
      { source: 'usr_ent3', target: 'stp_3', type: 'FOUNDED' }
    ];
  }

  loadNetworkGraph() {
    this.loading = true;
    this.apiService.get('/graph/network').subscribe({
      next: (res) => {
        this.loading = false;
        this.lastResponse = res;
        const nodesFromApi = (res && res.nodes && res.nodes.length > 0) ? res.nodes : this.getDefaultNodes();
        const edgesFromApi = (res && res.relationships && res.relationships.length > 0) ? res.relationships : this.getDefaultEdges();

        this.ngZone.run(() => {
          this.rawNodes = nodesFromApi;
          this.rawEdges = edgesFromApi;
          this.buildTreeHierarchy(this.rawNodes, this.rawEdges);
          this.processGraphData(this.rawNodes, this.rawEdges);
          this.applyFilters();
        });
      },
      error: () => {
        this.loading = false;
        this.loadFallbackGraph();
      }
    });
  }

  executeQuery() {
    this.loading = true;
    this.apiService.post('/graph/cypher', { query: this.cypherQuery, params: { vc_id: 'usr_vc1' } }).subscribe({
      next: (res) => {
        this.loading = false;
        this.lastResponse = res;
        const nodesFromApi = (res && res.nodes && res.nodes.length > 0) ? res.nodes : this.getDefaultNodes();
        const edgesFromApi = (res && res.relationships && res.relationships.length > 0) ? res.relationships : this.getDefaultEdges();

        this.ngZone.run(() => {
          this.rawNodes = nodesFromApi;
          this.rawEdges = edgesFromApi;
          this.buildTreeHierarchy(this.rawNodes, this.rawEdges);
          this.processGraphData(this.rawNodes, this.rawEdges);
          this.applyFilters();
        });
      },
      error: () => {
        this.loading = false;
        this.loadFallbackGraph();
      }
    });
  }

  loadFallbackGraph() {
    this.ngZone.run(() => {
      this.rawNodes = this.getDefaultNodes();
      this.rawEdges = this.getDefaultEdges();
      this.buildTreeHierarchy(this.rawNodes, this.rawEdges);
      this.processGraphData(this.rawNodes, this.rawEdges);
      this.applyFilters();
    });
  }

  buildTreeHierarchy(rawNodes, rawEdges) {
    const adminNodes = rawNodes.filter(n => n.label === 'Admin');
    const vcNodes = rawNodes.filter(n => n.label === 'VC');
    const startupNodes = rawNodes.filter(n => n.label === 'Startup');
    const entNodes = rawNodes.filter(n => n.label === 'Entrepreneur');

    const rootNodes = [...adminNodes, ...vcNodes];

    this.treeNodes = rootNodes.map(root => {
      const connEdges = rawEdges.filter(e => e.source === root.id && (e.type === 'INVESTED_IN' || e.type === 'CO_INVESTED_WITH' || e.type === 'VERIFIED_AND_APPROVED' || e.type === 'EVALUATED'));
      const children = connEdges.map(edge => {
        const st = startupNodes.find(s => s.id === edge.target) || { id: edge.target, properties: { name: 'NovaPay Tech' } };
        const founderEdges = rawEdges.filter(fe => fe.target === st.id && fe.type === 'FOUNDED');
        const founders = founderEdges.map(fe => {
          const ent = entNodes.find(e => e.id === fe.source);
          return { name: ent ? (ent.properties.name || ent.id) : 'Sarah Chen' };
        });

        return {
          id: st.id,
          name: st.properties?.name || 'NovaPay Tech',
          industry: st.properties?.industry || 'FinTech',
          stage: st.properties?.stage || 'Seed',
          founders: founders.length ? founders : [{ name: 'Sarah Chen' }]
        };
      });

      return {
        id: root.id,
        label: root.label,
        name: root.properties?.name || root.id,
        firm: root.properties?.firm || 'VentureConnect HQ',
        children: children.length ? children : [
          { id: 'stp_1', name: 'NovaPay Tech', industry: 'FinTech', stage: 'Seed', founders: [{ name: 'Sarah Chen' }] }
        ]
      };
    });
  }

  processGraphData(rawNodes, rawEdges) {
    const width = 900;
    const height = 580;

    const nodeMap = new Map();
    const clusterCenters = [
      { x: width * 0.20, y: height * 0.30 },
      { x: width * 0.40, y: height * 0.35 },
      { x: width * 0.70, y: height * 0.45 },
      { x: width * 0.50, y: height * 0.75 }
    ];

    rawNodes.forEach((n, index) => {
      if (!nodeMap.has(n.id)) {
        const title = n.properties?.name || n.properties?.firm || n.id;
        const cluster = clusterCenters[index % clusterCenters.length];

        const offsetX = (Math.random() - 0.5) * 220;
        const offsetY = (Math.random() - 0.5) * 180;

        nodeMap.set(n.id, {
          id: n.id,
          label: n.label || 'Node',
          title: title,
          properties: n.properties || {},
          x: Math.max(40, Math.min(width - 40, cluster.x + offsetX)),
          y: Math.max(40, Math.min(height - 40, cluster.y + offsetY)),
          radius: Math.floor(Math.random() * 6) + 14
        });
      }
    });

    this.nodes = Array.from(nodeMap.values());
    if (this.nodes.length > 0) {
      this.selectedNode = this.nodes[0];
    }

    this.edges = rawEdges.map(e => ({
      source: e.source,
      target: e.target,
      type: e.type || 'CONNECTED'
    }));

    this.activeDisplayNodes = this.nodes;
    this.activeDisplayEdges = this.edges;
  }

  initCanvas() {
    if (this.canvasRef) {
      const canvas = this.canvasRef.nativeElement;
      canvas.width = canvas.parentElement.clientWidth || 900;
      canvas.height = 580;
      this.ctx = canvas.getContext('2d');
    }
  }

  renderGraph() {
    if (!this.canvasRef || !this.ctx) return;
    const canvas = this.canvasRef.nativeElement;
    const ctx = this.ctx;

    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const displayNodes = this.activeDisplayNodes;
    const displayEdges = this.activeDisplayEdges;

    // 1. Draw Multi-Connected Lines
    displayEdges.forEach(edge => {
      const sourceNode = displayNodes.find(n => n.id === edge.source);
      const targetNode = displayNodes.find(n => n.id === edge.target);

      if (sourceNode && targetNode) {
        ctx.beginPath();
        ctx.moveTo(sourceNode.x, sourceNode.y);
        ctx.lineTo(targetNode.x, targetNode.y);
        
        if (edge.type === 'VERIFIED_AND_APPROVED') {
          ctx.strokeStyle = 'rgba(255, 193, 7, 0.7)';
        } else if (edge.type === 'FOUNDED') {
          ctx.strokeStyle = 'rgba(156, 39, 176, 0.7)';
        } else {
          ctx.strokeStyle = 'rgba(0, 242, 254, 0.5)';
        }
        ctx.lineWidth = 2.4;
        ctx.stroke();
      }
    });

    // 2. Draw Glowing Spheres for Admin 🛡️, VC 💼, Entrepreneur 🚀, Startup 💡
    displayNodes.forEach(node => {
      const isSelected = this.selectedNode && this.selectedNode.id === node.id;
      const glowRadius = isSelected ? node.radius * 3.5 : node.radius * 2.5;
      const gradient = ctx.createRadialGradient(node.x, node.y, 2, node.x, node.y, glowRadius);
      
      let glowColor = 'rgba(0, 242, 254, 0.95)';
      if (node.label === 'Admin') glowColor = 'rgba(255, 193, 7, 0.95)';
      else if (node.label === 'Entrepreneur') glowColor = 'rgba(156, 39, 176, 0.95)';
      else if (node.label === 'Startup') glowColor = 'rgba(40, 167, 69, 0.95)';

      gradient.addColorStop(0, glowColor);
      gradient.addColorStop(0.5, 'rgba(0, 210, 255, 0.35)');
      gradient.addColorStop(1, 'rgba(0, 210, 255, 0)');

      ctx.beginPath();
      ctx.arc(node.x, node.y, glowRadius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius * 0.7, 0, Math.PI * 2);
      
      if (node.label === 'Admin') ctx.fillStyle = '#ffc107';
      else if (node.label === 'Entrepreneur') ctx.fillStyle = '#d946ef';
      else if (node.label === 'Startup') ctx.fillStyle = '#10b981';
      else ctx.fillStyle = '#00f2fe';
      
      ctx.fill();

      ctx.font = 'bold 11px monospace';
      ctx.fillStyle = '#e2e8f0';
      ctx.textAlign = 'left';
      ctx.fillText(`:${node.label} (${node.title})`, node.x + node.radius + 6, node.y + 4);
    });
  }

  onCanvasMouseDown(event) {
    if (!this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const clickedNode = this.activeDisplayNodes.find(n => {
      const dx = n.x - mouseX;
      const dy = n.y - mouseY;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius * 2;
    });

    if (clickedNode) {
      this.selectedNode = clickedNode;
      this.isDragging = true;
      this.draggedNode = clickedNode;
      this.renderGraph();
    }
  }

  onCanvasMouseMove(event) {
    if (this.isDragging && this.draggedNode && this.canvasRef) {
      const canvas = this.canvasRef.nativeElement;
      const rect = canvas.getBoundingClientRect();
      this.draggedNode.x = event.clientX - rect.left;
      this.draggedNode.y = event.clientY - rect.top;
      this.renderGraph();
    }
  }

  onCanvasMouseUp() {
    this.isDragging = false;
    this.draggedNode = null;
  }
}
