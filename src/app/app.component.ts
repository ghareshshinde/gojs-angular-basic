import { ChangeDetectorRef, Component, NgZone, ViewChild, ViewEncapsulation } from '@angular/core';
import * as go from 'gojs';
import { DataSyncService, DiagramComponent } from 'gojs-angular';

import {
  BRAIN, layerDepartments, buildGraph, computeStats, findDept, findSkill,
  Department, Skill, Stats, Layer
} from './company-data';

type Tab = 'map' | 'dashboards' | 'chart';
type Kind = 'brain' | 'dept' | 'skill' | 'agent' | null;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {

  @ViewChild('myDiagram', { static: true }) public myDiagramComponent: DiagramComponent;

  /* ----- exposed to the template ----- */
  public brain = BRAIN;
  public activeLayer: Layer = 'company';
  public departments: Department[] = layerDepartments(this.activeLayer);
  public stats: Stats = computeStats(this.departments);
  public activeTab: Tab = 'map';

  /* the autonomy ladder shown on every skill detail panel */
  public ladder = [
    { key: 'manual',     name: 'Human-led',       text: 'A person does the work; the agent only assists on request.' },
    { key: 'assisted',   name: 'Human-assisted',  text: 'The agent drafts and acts; a human reviews before it ships.' },
    { key: 'autonomous', name: 'Fully autonomous', text: 'The agent runs the loop end-to-end and writes the result back.' }
  ];

  /* ----- selection state (drives the detail panel) ----- */
  public selectedKind: Kind = 'brain';
  public selectedDept: Department | null = null;
  public selectedSkill: Skill | null = null;
  public selectedAgent: { name: string, dept: Department, skill: Skill } | null = null;

  /* ----- GoJS model, built from the active layer ----- */
  private graph = buildGraph(this.departments);
  public diagramNodeData: Array<go.ObjectData> = this.graph.nodeDataArray;
  public diagramLinkData: Array<go.ObjectData> = this.graph.linkDataArray;
  public diagramDivClassName = 'company-map';
  public diagramModelData: go.ObjectData = { prop: 'value' };
  public skipsDiagramUpdate = false;

  private diagram: go.Diagram | null = null;
  private focusedDept: string | null = null;

  constructor(private cdr: ChangeDetectorRef, private zone: NgZone) {}

  /* ============================================================= *
   *  Diagram construction                                         *
   * ============================================================= */
  public initDiagram = (): go.Diagram => {
    const $ = go.GraphObject.make;

    const dia = $(go.Diagram, {
      'undoManager.isEnabled': false,
      isReadOnly: true,
      allowMove: false,
      allowCopy: false,
      allowDelete: false,
      // never auto-arrange: every node carries the radial location we computed
      layout: $(go.Layout, { isInitial: false, isOngoing: false }),
      initialAutoScale: go.Diagram.Uniform,
      initialContentAlignment: go.Spot.Center,
      // reserve room on the right for the detail panel so the map centres in the visible area
      padding: new go.Margin(50, 410, 50, 50),
      minScale: 0.1,
      maxScale: 3,
      'toolManager.hoverDelay': 120,
      'animationManager.isEnabled': true,
      model: $(go.GraphLinksModel, { linkKeyProperty: 'key' })
    });

    // NOTE: a fresh Binding must be created per template — GoJS Bindings cannot be shared.
    const loc = () => new go.Binding('location', 'loc', (s: string) => {
      const parts = ('' + s).split(' ');
      return new go.Point(parseFloat(parts[0]), parseFloat(parts[1]));
    });

    /* ---- the Company Brain (centre) ---- */
    dia.nodeTemplateMap.add('brain',
      $(go.Node, 'Spot',
        { locationSpot: go.Spot.Center, locationObjectName: 'CORE', cursor: 'pointer', selectionAdorned: false,
          isShadowed: true, shadowColor: '#c4b5fd', shadowBlur: 26, shadowOffset: new go.Point(0, 0) },
        loc(),
        $(go.Shape, 'Circle', { desiredSize: new go.Size(190, 190), strokeWidth: 0, shadowVisible: false,
          fill: $(go.Brush, 'Radial', { 0: 'rgba(255,255,255,0.30)', 0.4: 'rgba(190,180,255,0.12)', 1: 'rgba(10,8,30,0)' }) }),
        $(go.Shape, 'Circle', { name: 'CORE', desiredSize: new go.Size(20, 20), strokeWidth: 0,
          fill: $(go.Brush, 'Radial', { 0: '#ffffff', 1: '#b7a6ff' }) }),
        $(go.TextBlock, 'SAARTHI BRAIN',
          { alignment: new go.Spot(0.5, 0.5, 0, 78), stroke: 'rgba(233,229,255,0.92)',
            font: '600 12px Inter, system-ui, sans-serif', textAlign: 'center' })
      )
    );

    /* ---- decorative centre particles ---- */
    dia.nodeTemplateMap.add('spark',
      $(go.Node, 'Spot',
        { locationSpot: go.Spot.Center, pickable: false, selectable: false },
        loc(),
        $(go.Shape, 'Circle',
          { strokeWidth: 0 },
          new go.Binding('desiredSize', 'size', (s: number) => new go.Size(s, s)),
          new go.Binding('fill', 'color', (c: string) => this.rgba(c, 0.85)))
      )
    );

    /* ---- department hub ---- */
    dia.nodeTemplateMap.add('dept',
      $(go.Node, 'Spot',
        { locationSpot: go.Spot.Center, cursor: 'pointer', selectionAdorned: false,
          isShadowed: true, shadowBlur: 16, shadowOffset: new go.Point(0, 0) },
        new go.Binding('shadowColor', 'color'),
        loc(),
        $(go.Shape, 'Circle', { desiredSize: new go.Size(96, 96), strokeWidth: 0, shadowVisible: false },
          new go.Binding('fill', 'color', (c: string) =>
            $(go.Brush, 'Radial', { 0: this.rgba(c, 0.34), 1: this.rgba(c, 0) }))),
        $(go.Shape, 'Circle',
          { name: 'RING', desiredSize: new go.Size(38, 38), strokeWidth: 2, fill: '#141131' },
          new go.Binding('stroke', 'color'),
          new go.Binding('desiredSize', 'isSelected', (s: boolean) =>
            s ? new go.Size(46, 46) : new go.Size(38, 38)).ofObject()),
        $(go.TextBlock, { alignment: go.Spot.Center, font: '15px sans-serif' },
          new go.Binding('text', 'text'))
      )
    );

    /* ---- department perimeter label ---- */
    dia.nodeTemplateMap.add('deptlabel',
      $(go.Node, 'Vertical',
        { locationSpot: go.Spot.Center, cursor: 'pointer', selectionAdorned: false },
        loc(),
        $(go.TextBlock,
          { font: '700 19px Inter, system-ui, sans-serif', stroke: '#e9e5ff' },
          new go.Binding('text', 'text'),
          new go.Binding('stroke', 'isSelected', (s: boolean) => s ? '#ffffff' : '#e9e5ff').ofObject()),
        $(go.TextBlock,
          { font: '10px Inter, system-ui, sans-serif', stroke: 'rgba(180,175,210,0.7)', margin: new go.Margin(3, 0, 0, 0) },
          new go.Binding('text', 'sub'))
      )
    );

    /* ---- skill node ---- */
    dia.nodeTemplateMap.add('skill',
      $(go.Node, 'Vertical',
        { locationSpot: go.Spot.Center, cursor: 'pointer', selectionAdorned: false, isShadowed: false },
        loc(),
        $(go.Panel, 'Spot',
          $(go.Shape, 'Circle', { desiredSize: new go.Size(44, 44), strokeWidth: 0 },
            new go.Binding('fill', 'color', (c: string) =>
              $(go.Brush, 'Radial', { 0: this.rgba(c, 0.22), 1: this.rgba(c, 0) }))),
          $(go.Shape, 'Circle',
            { name: 'DOT', desiredSize: new go.Size(22, 22), strokeWidth: 1.5, fill: '#17143a' },
            new go.Binding('stroke', 'color'),
            new go.Binding('fill', 'isSelected', (s: boolean) => s ? '#241d55' : '#17143a').ofObject(),
            new go.Binding('desiredSize', 'isSelected', (s: boolean) =>
              s ? new go.Size(27, 27) : new go.Size(22, 22)).ofObject()),
          $(go.TextBlock, { alignment: go.Spot.Center, font: '10px sans-serif' },
            new go.Binding('text', 'text')),
          // small status pip
          $(go.Shape, 'Circle',
            { alignment: new go.Spot(1, 0, 2, 0), desiredSize: new go.Size(7, 7), strokeWidth: 0 },
            new go.Binding('fill', 'status', (s: string) => this.statusColor(s)))
        ),
        $(go.TextBlock,
          { font: '600 7px Inter, system-ui, sans-serif', stroke: 'rgba(214,210,240,0.55)',
            margin: new go.Margin(4, 0, 0, 0), maxSize: new go.Size(90, NaN), textAlign: 'center' },
          new go.Binding('text', 'label'),
          new go.Binding('stroke', 'isSelected', (s: boolean) =>
            s ? 'rgba(255,255,255,0.95)' : 'rgba(214,210,240,0.55)').ofObject())
      )
    );

    /* ---- agent leaf ---- */
    dia.nodeTemplateMap.add('agent',
      $(go.Node, 'Spot',
        { locationSpot: go.Spot.Center, cursor: 'pointer', selectionAdorned: false,
          toolTip:
            $('ToolTip',
              { 'Border.stroke': 'rgba(255,255,255,0.15)', 'Border.fill': '#1a1638' },
              $(go.TextBlock, { margin: 6, stroke: '#eae7ff', font: '11px Inter, system-ui, sans-serif' },
                new go.Binding('text', 'text'))) },
        loc(),
        $(go.Shape, 'Circle', { desiredSize: new go.Size(16, 16), strokeWidth: 0 },
          new go.Binding('fill', 'color', (c: string) =>
            $(go.Brush, 'Radial', { 0: this.rgba(c, 0.55), 1: this.rgba(c, 0) }))),
        $(go.Shape, 'Circle',
          { name: 'PIP', desiredSize: new go.Size(6.5, 6.5), strokeWidth: 0 },
          new go.Binding('fill', 'color', (c: string) => this.rgba(c, 0.95)),
          new go.Binding('desiredSize', 'isSelected', (s: boolean) =>
            s ? new go.Size(11, 11) : new go.Size(6.5, 6.5)).ofObject())
      )
    );

    /* ---- links ---- */
    dia.linkTemplate =
      $(go.Link,
        { routing: go.Link.Normal, curve: go.Link.Bezier, selectable: false, pickable: false },
        $(go.Shape,
          new go.Binding('stroke', '', (d: any) => this.rgba(d.color || '#8b83c9', d.main ? 0.45 : 0.22)).ofObject(),
          new go.Binding('strokeWidth', '', (d: any) => d.main ? 1.4 : 0.8).ofObject())
      );

    /* selection & background listeners */
    dia.addDiagramListener('ChangedSelection', (e) => {
      const node = e.diagram.selection.first();
      if (node && node.data) { this.zone.run(() => this.onSelect(node.data)); }
    });
    dia.addDiagramListener('BackgroundSingleClicked', () => {
      this.zone.run(() => this.resetSelection());
    });

    this.diagram = dia;
    return dia;
  }

  public diagramModelChange = (changes: go.IncrementalData) => {
    this.skipsDiagramUpdate = true;
    this.diagramNodeData = DataSyncService.syncNodeData(changes, this.diagramNodeData);
    this.diagramLinkData = DataSyncService.syncLinkData(changes, this.diagramLinkData);
    this.diagramModelData = DataSyncService.syncModelData(changes, this.diagramModelData);
  }

  public ngAfterViewInit() {
    // default state: the brain is selected
    this.onSelect({ category: 'brain', key: 'BRAIN' });
    this.cdr.detectChanges();
    // refit once the flex layout has given the diagram its final size
    setTimeout(() => { if (this.diagram) { this.diagram.zoomToFit(); } }, 350);
    window.addEventListener('resize', () => {
      if (this.diagram && this.activeTab === 'map' && !this.focusedDept) { this.diagram.zoomToFit(); }
    });
  }

  /* ============================================================= *
   *  Selection handling                                           *
   * ============================================================= */
  private onSelect(data: any) {
    this.selectedDept = null;
    this.selectedSkill = null;
    this.selectedAgent = null;

    switch (data.category) {
      case 'brain':
        this.selectedKind = 'brain';
        this.focusDepartment(null);
        break;

      case 'dept':
      case 'deptlabel': {
        const key = data.ref || data.key;
        this.selectedKind = 'dept';
        this.selectedDept = findDept(this.departments, key);
        this.focusDepartment(key);
        break;
      }

      case 'skill': {
        const res = findSkill(this.departments, data.dept, data.skillIndex);
        this.selectedKind = 'skill';
        this.selectedDept = res ? res.dept : null;
        this.selectedSkill = res ? res.skill : null;
        this.focusDepartment(data.dept);
        break;
      }

      case 'agent': {
        const res = findSkill(this.departments, data.dept, data.skillIndex);
        if (res) {
          this.selectedKind = 'agent';
          this.selectedDept = res.dept;
          this.selectedSkill = res.skill;
          this.selectedAgent = { name: data.text, dept: res.dept, skill: res.skill };
        }
        this.focusDepartment(data.dept);
        break;
      }
    }
  }

  private resetSelection() {
    this.selectedKind = 'brain';
    this.selectedDept = null;
    this.selectedSkill = null;
    this.selectedAgent = null;
    if (this.diagram) { this.diagram.clearSelection(); }
    this.focusDepartment(null);
  }

  /** Public: select a department from the HTML legend / dashboards. */
  public pickDepartment(deptKey: string) {
    this.activeTab = 'map';
    if (!this.diagram) { return; }
    const node = this.diagram.findNodeForKey(deptKey);
    if (node) {
      this.diagram.select(node);   // fires ChangedSelection -> onSelect
    }
  }

  /* ============================================================= *
   *  Focus + zoom on a department subtree                         *
   * ============================================================= */
  private focusDepartment(deptKey: string | null) {
    this.focusedDept = deptKey;
    const dia = this.diagram;
    if (!dia) { return; }

    dia.startTransaction('focus');
    dia.nodes.each((node: go.Node) => {
      const d = node.data;
      let on = true;
      if (deptKey) {
        on = d.category === 'brain' || d.category === 'spark' || d.dept === deptKey;
      }
      node.opacity = on ? 1 : 0.09;
    });
    dia.links.each((link: go.Link) => {
      link.opacity = deptKey ? (this.linkBelongs(link, deptKey) ? 1 : 0.05) : 1;
    });
    dia.commitTransaction('focus');

    // zoom
    if (deptKey) {
      let area: go.Rect | null = null;
      dia.nodes.each((node: go.Node) => {
        if (node.data.dept === deptKey && node.data.category !== 'deptlabel') {
          area = area ? area.unionRect(node.actualBounds) : node.actualBounds.copy();
        }
      });
      if (area) {
        area.inflate(140, 140);
        dia.zoomToRect(area, go.Diagram.Uniform);
      }
    } else {
      dia.zoomToFit();
    }
  }

  private linkBelongs(link: go.Link, deptKey: string): boolean {
    const to = link.toNode;
    const from = link.fromNode;
    return (to && to.data.dept === deptKey) || (from && from.data.dept === deptKey);
  }

  /* ============================================================= *
   *  Views / tabs                                                 *
   * ============================================================= */
  public setTab(tab: Tab) {
    this.activeTab = tab;
    if (tab === 'map' && this.diagram) {
      // the map div was visible underneath, nothing to re-measure
      setTimeout(() => { if (this.diagram) { this.diagram.requestUpdate(); } }, 0);
    }
  }

  public resetView() {
    this.resetSelection();
    if (this.diagram) { this.diagram.zoomToFit(); }
  }

  /** Switch between the Company (Layer A) and Family (Layer B) agent org. */
  public setLayer(layer: Layer) {
    if (layer === this.activeLayer) { return; }
    this.activeLayer = layer;
    this.departments = layerDepartments(layer);
    this.stats = computeStats(this.departments);

    const g = buildGraph(this.departments);
    this.diagramNodeData = g.nodeDataArray;
    this.diagramLinkData = g.linkDataArray;

    if (this.diagram) {
      const model = new go.GraphLinksModel(g.nodeDataArray, g.linkDataArray);
      model.linkKeyProperty = 'key';
      this.diagram.model = model;   // templates live on the diagram, so they persist
    }
    this.focusedDept = null;
    this.resetSelection();
    this.onSelect({ category: 'brain', key: 'BRAIN' });
    setTimeout(() => { if (this.diagram) { this.diagram.zoomToFit(); } }, 50);
  }

  /* ============================================================= *
   *  Small template helpers                                       *
   * ============================================================= */
  public statusLabel(s: string): string {
    return s === 'live' ? 'Live' : s === 'dev' ? 'In development' : 'Planned';
  }
  public statusColor(s: string): string {
    return s === 'live' ? '#34d399' : s === 'dev' ? '#fbbf24' : '#6b7280';
  }
  public autonomyLabel(a: string): string {
    return a === 'autonomous' ? 'Fully autonomous' : a === 'assisted' ? 'Human-assisted' : 'Human-led';
  }
  public pct(part: number, whole: number): number {
    return whole ? Math.round((part / whole) * 100) : 0;
  }

  public deptAgentCount(dept: Department): number {
    return dept.skills.reduce((sum, s) => sum + s.agents.length, 0);
  }

  public pickSkill(deptKey: string, index: number) {
    this.activeTab = 'map';
    if (!this.diagram) { return; }
    const node = this.diagram.findNodeForKey(deptKey + '::' + index);
    if (node) { this.diagram.select(node); }
  }

  public skillIndexOf(dept: Department, skill: Skill): number {
    return dept.skills.indexOf(skill);
  }

  public statusOf(s: string): number {
    return (this.stats.status as any)[s] || 0;
  }
  public autonomyOf(a: string): number {
    return (this.stats.autonomy as any)[a] || 0;
  }
  public maxDeptAgents(): number {
    return this.stats.departments.reduce((m, d) => Math.max(m, d.agents), 0);
  }

  /** rgba border tint for cards / tags (public for the template). */
  public rgbaBorder(hex: string): string {
    return this.rgba(hex, 0.4);
  }

  /** hex (#rrggbb) -> rgba(...) with alpha */
  private rgba(hex: string, a: number): string {
    if (!hex || hex[0] !== '#') { return hex; }
    const r = parseInt(hex.substr(1, 2), 16);
    const g = parseInt(hex.substr(3, 2), 16);
    const b = parseInt(hex.substr(5, 2), 16);
    return `rgba(${r},${g},${b},${a})`;
  }
}
