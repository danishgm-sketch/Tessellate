import type { ClientScenario } from './benchmark-types.js';

interface DomainTemplate {
  domain: string;
  archetypes: string[];
  clientProfiles: Array<{
    name: string;
    focus: string;
    entities: string[];
    workflows: string[];
  }>;
  feels: string[];
  visualAmbitionRange: [number, number];
  structuralCreativityRange: [number, number];
  accessibilityFloors: Array<'A' | 'AA' | 'AAA'>;
  performanceCeilings: Array<'lightweight' | 'balanced' | 'rich'>;
  deviceConfigs: Array<Array<'desktop' | 'tablet' | 'mobile'>>;
}

const DOMAIN_TEMPLATES: DomainTemplate[] = [
  {
    domain: 'Fintech & Quantitative Trading',
    archetypes: ['fintech', 'analytics', 'saas'],
    clientProfiles: [
      { name: 'Aethelgard Quant Systems', focus: 'High-frequency algorithmic equity execution and dark pool order routing', entities: ['ExecutionOrder', 'DarkPoolQuote', 'MarketDepth'], workflows: ['Route algorithmic parent orders', 'Triage microstructure latency alerts'] },
      { name: 'Apex Sovereign Capital', focus: 'Multi-asset macro portfolio risk telemetry and Value-at-Risk stress testing', entities: ['PortfolioBook', 'RiskFactor', 'StressScenario'], workflows: ['Run historical Monte Carlo simulations', 'Rebalance cross-currency exposures'] },
      { name: 'Veritas Institutional Lending', focus: 'Automated syndicated corporate credit underwriting and covenant compliance', entities: ['CreditFacility', 'BorrowerAudit', 'CovenantRatio'], workflows: ['Underwrite tranche debt', 'Audit borrower quarterly compliance'] },
      { name: 'Bifrost Derivatives Clearing', focus: 'Real-time collateral margin optimization and central counterparty settlement', entities: ['MarginCall', 'CollateralAsset', 'SettlementBatch'], workflows: ['Calculate intraday variation margin', 'Transfer cross-depository collateral'] },
      { name: 'Chronos Digital Asset Custody', focus: 'Institutional crypto MPC multi-sig treasury management and staking yield', entities: ['VaultKeyShare', 'TreasuryPolicy', 'StakingReward'], workflows: ['Sign threshold governance policy', 'Reallocate liquid staking reserves'] },
    ],
    feels: ['dense and tactical', 'clean and trustworthy', 'dark and precise', 'futuristic and sharp'],
    visualAmbitionRange: [25, 60],
    structuralCreativityRange: [20, 50],
    accessibilityFloors: ['AA', 'AAA'],
    performanceCeilings: ['rich', 'balanced'],
    deviceConfigs: [['desktop'], ['desktop', 'tablet']],
  },
  {
    domain: 'Healthcare & Clinical Operations',
    archetypes: ['saas', 'crm', 'erp-operations'],
    clientProfiles: [
      { name: 'Aegis Health Systems', focus: 'Hospital intensive care unit bed telemetry and emergency room triage', entities: ['PatientVitals', 'ICUBed', 'TriageEncounter'], workflows: ['Monitor continuous bedside hemodynamics', 'Discharge and sanitize isolation wards'] },
      { name: 'OncoPath Oncology Network', focus: 'Multi-disciplinary tumor board clinical trial matching and genomic pathology', entities: ['BiopsySpecimen', 'MolecularProfile', 'TrialProtocol'], workflows: ['Review somatic sequencing variants', 'Enroll patients into targeted therapy'] },
      { name: 'Caduceus Telemedicine', focus: 'Decentralized remote specialist consultation and asynchronous video care', entities: ['ConsultationSession', 'DigitalPrescription', 'MedicalHistory'], workflows: ['Conduct encrypted video consults', 'Route electronic pharmacy prescriptions'] },
      { name: 'Syntropy Pediatric Therapeutics', focus: 'Rare disease clinical registry and patient-reported outcome tracking', entities: ['RegistryCohort', 'DosingSchedule', 'PatientSymptomLog'], workflows: ['Track developmental milestones', 'Analyze adverse therapy events'] },
    ],
    feels: ['calm and clinical', 'warm and accessible', 'clean and trustworthy'],
    visualAmbitionRange: [20, 45],
    structuralCreativityRange: [15, 40],
    accessibilityFloors: ['AA', 'AAA'],
    performanceCeilings: ['balanced', 'lightweight'],
    deviceConfigs: [['desktop', 'tablet', 'mobile'], ['tablet', 'mobile'], ['desktop']],
  },
  {
    domain: 'Developer Tooling & Cloud Infrastructure',
    archetypes: ['developer-tools', 'saas', 'analytics'],
    clientProfiles: [
      { name: 'Vortex Mesh Systems', focus: 'Distributed microservice service mesh observability and eBPF kernel tracing', entities: ['ServiceSpan', 'KernelTrace', 'LatencySpike'], workflows: ['Trace distributed request spans', 'Deploy canary traffic routing rules'] },
      { name: 'Hyperplane CI/CD', focus: 'Serverless ephemeral build container pipelines with automated cache sharding', entities: ['PipelineRun', 'BuildArtifact', 'DependencyCache'], workflows: ['Trigger matrix parallel test suites', 'Inspect failed docker layer diagnostics'] },
      { name: 'Nexus Schema Registry', focus: 'Unified GraphQL, Protobuf, and OpenAPI schema federation and breaking change linting', entities: ['SchemaContract', 'BreakingDiff', 'ConsumerClient'], workflows: ['Validate schema pull requests', 'Deprecate downstream legacy fields'] },
      { name: 'CloudWeave Terraform Engine', focus: 'Multi-cloud declarative infrastructure drift detection and state management', entities: ['CloudResource', 'StateSnapshot', 'DriftAnomaly'], workflows: ['Reconcile infrastructure drift', 'Plan speculative resource topology'] },
    ],
    feels: ['dense and technical', 'dark and precise', 'brutalist and raw', 'futuristic and sharp'],
    visualAmbitionRange: [30, 75],
    structuralCreativityRange: [30, 70],
    accessibilityFloors: ['AA', 'AAA'],
    performanceCeilings: ['rich', 'balanced'],
    deviceConfigs: [['desktop'], ['desktop', 'tablet']],
  },
  {
    domain: 'AI/ML Operations & Generative Workspaces',
    archetypes: ['ai', 'developer-tools', 'analytics'],
    clientProfiles: [
      { name: 'CognitiveForge Studio', focus: 'Prompt engineering workspace with automated multi-LLM benchmark evaluation', entities: ['PromptVariant', 'InferenceBenchmark', 'HallucinationScore'], workflows: ['Run matrix prompt evaluations', 'Deploy system guardrails to edge'] },
      { name: 'TensorStream MLOps', focus: 'GPU cluster training telemetry, gradient loss monitoring, and checkpoint rollback', entities: ['TrainingEpoch', 'GPUCluster', 'ModelCheckpoint'], workflows: ['Monitor loss divergence', 'Save distributed model checkpoints'] },
      { name: 'VectorLoom Memory Layer', focus: 'High-dimensional semantic vector index clustering and semantic cache inspection', entities: ['VectorCluster', 'EmbeddingRecord', 'CacheHitRate'], workflows: ['Visualize t-SNE embedding clouds', 'Purge stale embedding indices'] },
      { name: 'SyntheticMind Data Factory', focus: 'Bespoke synthetic dataset generation, alignment validation, and privacy scrubbing', entities: ['SyntheticRecord', 'PIIMaskingRule', 'DistributionDiff'], workflows: ['Generate aligned domain datasets', 'Verify differential privacy thresholds'] },
    ],
    feels: ['futuristic and sharp', 'dense and technical', 'dark and precise', 'luxe and editorial'],
    visualAmbitionRange: [50, 95],
    structuralCreativityRange: [40, 85],
    accessibilityFloors: ['AA'],
    performanceCeilings: ['rich', 'balanced'],
    deviceConfigs: [['desktop'], ['desktop', 'tablet', 'mobile']],
  },
  {
    domain: 'Biotech & Computational Life Sciences',
    archetypes: ['intelligence-research', 'analytics', 'saas'],
    clientProfiles: [
      { name: 'HelixCraft Genomics', focus: 'CRISPR Cas9 off-target endonuclease cleavage prediction and guide-RNA design', entities: ['GuideRNA', 'CleavageSite', 'OffTargetRiskScore'], workflows: ['Synthesize safe guide oligos', 'Analyze high-throughput sequencing reads'] },
      { name: 'ProteoDynamics Lab', focus: 'Macro-molecular docking simulations and cryo-EM electron density map fitting', entities: ['LigandConformation', 'BindingPocket', 'RMSDMetric'], workflows: ['Dock novel small molecules', 'Refine atomic coordinates against density maps'] },
      { name: 'CellularAtlas Omics', focus: 'Single-cell RNA sequencing trajectory inference and cell-type clustering', entities: ['SingleCellCell', 'GeneExpressionMatrix', 'CellTrajectory'], workflows: ['Cluster heterogeneous cell populations', 'Trace stem cell lineage trajectories'] },
    ],
    feels: ['dense and technical', 'clean and trustworthy', 'calm and clinical'],
    visualAmbitionRange: [40, 80],
    structuralCreativityRange: [30, 65],
    accessibilityFloors: ['AA', 'AAA'],
    performanceCeilings: ['rich', 'balanced'],
    deviceConfigs: [['desktop'], ['desktop', 'tablet']],
  },
  {
    domain: 'Cybersecurity & SOC Operations',
    archetypes: ['saas', 'analytics', 'developer-tools'],
    clientProfiles: [
      { name: 'SentinelGrid Threat Intel', focus: 'Automated Security Operations Center incident triage and lateral movement containment', entities: ['SecurityIncident', 'HostEndpoint', 'ThreatActorCampaign'], workflows: ['Isolate compromised corporate endpoints', 'Query global SIEM correlation rules'] },
      { name: 'ZeroShield Identity Perimeter', focus: 'Privileged access management and continuous biometric session risk scoring', entities: ['PrivilegedSession', 'BiometricAnomaly', 'EphemeralToken'], workflows: ['Revoke suspicious executive access', 'Grant step-up credential tokens'] },
      { name: 'VulnerabilityVault AppSec', focus: 'Automated static analysis, software bill of materials, and CVE vulnerability prioritization', entities: ['SoftwareComponent', 'CVEDisclosure', 'ExploitPoC'], workflows: ['Scan SBOM container images', 'Dispatch hotfix pull requests to repositories'] },
    ],
    feels: ['dark and precise', 'dense and tactical', 'futuristic and sharp'],
    visualAmbitionRange: [35, 70],
    structuralCreativityRange: [25, 55],
    accessibilityFloors: ['AA'],
    performanceCeilings: ['rich', 'balanced'],
    deviceConfigs: [['desktop'], ['desktop', 'tablet']],
  },
  {
    domain: 'E-Commerce & Omnichannel Retail',
    archetypes: ['ecommerce', 'consumer', 'saas'],
    clientProfiles: [
      { name: 'Aura Luxury Horology', focus: 'Authenticated luxury timepiece marketplace with blockchain provenance and escrow', entities: ['TimepieceListing', 'WatchCertificate', 'EscrowTransaction'], workflows: ['Verify timepiece serial authentication', 'Release multi-currency escrow funds'] },
      { name: 'ArtisanRoast Direct', focus: 'Subscription specialty coffee club with personalized taste profile algorithms', entities: ['RoastBlend', 'SubscriptionSchedule', 'TastePreferenceProfile'], workflows: ['Curate bi-weekly subscription shipments', 'Update roast profile preferences'] },
      { name: 'Verdant Botanical Home', focus: 'Direct-to-consumer rare plant nursery with seasonal climate shipping care guides', entities: ['BotanicalSpecimen', 'ClimatePackagingSpec', 'CareSchedule'], workflows: ['Schedule weather-guaranteed shipping', 'Provide horticultural care reminders'] },
      { name: 'Sartorial Tailors Digital', focus: 'Custom bespoke suiting 3D body photogrammetry and fabric drape simulation', entities: ['CustomerMeasurement', 'SuitFabricBolt', 'TailoringOrder'], workflows: ['Capture 3D camera measurements', 'Submit pattern to Master Tailor atelier'] },
    ],
    feels: ['luxe and editorial', 'warm and accessible', 'playful and bold', 'clean and trustworthy'],
    visualAmbitionRange: [60, 95],
    structuralCreativityRange: [40, 80],
    accessibilityFloors: ['AA'],
    performanceCeilings: ['rich', 'balanced'],
    deviceConfigs: [['desktop', 'tablet', 'mobile'], ['mobile']],
  },
  {
    domain: 'Two-Sided Marketplaces & Freelance Exchanges',
    archetypes: ['marketplace', 'saas', 'crm'],
    clientProfiles: [
      { name: 'MedLocum Surgeon Network', focus: 'Credentialed specialist surgical locum placement and hospital credentialing', entities: ['SurgeonProfile', 'HospitalShift', 'CredentialPacket'], workflows: ['Verify state medical licenses', 'Book emergency OR trauma coverage'] },
      { name: 'CineGear Professional Rental', focus: 'Insured cinema camera, anamorphic lens, and grip equipment peer-to-peer exchange', entities: ['CameraKit', 'RentalContract', 'EquipmentInspection'], workflows: ['Audit damage deposit and insurance policy', 'Coordinate secure courier pickup'] },
      { name: 'MaritimeCharter Vessel Board', focus: 'Commercial cargo ship and tugboat charter brokerage with maritime AIS tracking', entities: ['VesselRegistry', 'BunkerFuelInvoice', 'VoyageCharter'], workflows: ['Match dry bulk cargo with idle vessels', 'Calculate port demurrage fees'] },
    ],
    feels: ['clean and trustworthy', 'dense and tactical', 'warm and accessible'],
    visualAmbitionRange: [40, 75],
    structuralCreativityRange: [30, 60],
    accessibilityFloors: ['AA'],
    performanceCeilings: ['balanced', 'rich'],
    deviceConfigs: [['desktop', 'tablet', 'mobile'], ['desktop']],
  },
  {
    domain: 'GovTech, Civic & Municipal Services',
    archetypes: ['saas', 'crm', 'erp-operations'],
    clientProfiles: [
      { name: 'CivicFlow Municipal Permits', focus: 'Urban zoning building permits, structural code reviews, and inspector scheduling', entities: ['BuildingPermit', 'ZoningBlueprint', 'InspectionReport'], workflows: ['Submit architectural CAD plans', 'Dispatch municipal building inspector'] },
      { name: 'MetroTransit Dispatch Core', focus: 'City electric bus and light rail route dispatch, vehicle maintenance, and live passenger count', entities: ['TransitRoute', 'BusTelemetry', 'DriverSchedule'], workflows: ['Reroute vehicles around road closures', 'Monitor depot battery charging states'] },
      { name: 'PublicAid Relief Registry', focus: 'Emergency municipal disaster assistance, food distribution, and temporary housing voucher', entities: ['CitizenHousehold', 'AssistanceVoucher', 'DisasterClaim'], workflows: ['Verify household eligibility documents', 'Disburse emergency debit vouchers'] },
    ],
    feels: ['clean and trustworthy', 'warm and accessible', 'calm and clinical'],
    visualAmbitionRange: [15, 45],
    structuralCreativityRange: [15, 35],
    accessibilityFloors: ['AAA', 'AA'],
    performanceCeilings: ['lightweight', 'balanced'],
    deviceConfigs: [['desktop', 'tablet', 'mobile'], ['mobile']],
  },
  {
    domain: 'Logistics, Freight & Supply Chain',
    archetypes: ['erp-operations', 'analytics', 'saas'],
    clientProfiles: [
      { name: 'TransOcean Cold Chain', focus: 'Pharmaceutical temperature-controlled shipping container telematics and customs clearance', entities: ['ReeferContainer', 'TemperatureLog', 'CustomsManifest'], workflows: ['Monitor continuous cold-chain data loggers', 'Submit automated border customs declaration'] },
      { name: 'FreightMatrix Intermodal Hub', focus: 'Rail-to-truck container transfer dispatch and port crane terminal optimization', entities: ['IntermodalTrain', 'TerminalCrane', 'ContainerSlot'], workflows: ['Optimize crane stack moves', 'Assign drayage drivers to outbound freight'] },
      { name: 'SkyRoute Autonomous Cargo', focus: 'Heavy-payload drone delivery logistics, weather deconfliction, and battery hot-swap stations', entities: ['CargoDrone', 'FlightCorridor', 'DepotBattery'], workflows: ['Authorize autonomous flight paths', 'Schedule automated landing battery swap'] },
    ],
    feels: ['dense and tactical', 'dark and precise', 'clean and trustworthy'],
    visualAmbitionRange: [30, 65],
    structuralCreativityRange: [25, 55],
    accessibilityFloors: ['AA'],
    performanceCeilings: ['balanced', 'rich'],
    deviceConfigs: [['desktop'], ['desktop', 'tablet']],
  },
  {
    domain: 'Aerospace & Mission Control',
    archetypes: ['analytics', 'developer-tools', 'saas'],
    clientProfiles: [
      { name: 'OrbitalTelemetry Systems', focus: 'LEO satellite constellation orbit telemetry, solar panel degradation, and ground station links', entities: ['SatelliteBus', 'OrbitEphemeris', 'GroundPassContact'], workflows: ['Schedule ground station X-band downlink', 'Execute momentum wheel desaturation burn'] },
      { name: 'AeroDynamics Flight Test Bed', focus: 'Supersonic prototype wind tunnel telemetry, strain gauge arrays, and flutter analysis', entities: ['AirframeSensor', 'WindTunnelRun', 'AeroelasticFlutter'], workflows: ['Stream multi-channel strain sensors', 'Detect acoustic shockwave boundary layer separation'] },
      { name: 'SpaceDebris Conjunction Guard', focus: 'Orbital conjunction collision avoidance probability assessment and evasive burn planner', entities: ['DebrisObject', 'MissDistanceConjunction', 'EvasiveManeuver'], workflows: ['Compute covariance ellipsoid collision risk', 'Transmit burn coordinates to flight computer'] },
    ],
    feels: ['dense and technical', 'dark and precise', 'futuristic and sharp'],
    visualAmbitionRange: [45, 85],
    structuralCreativityRange: [35, 75],
    accessibilityFloors: ['AA', 'AAA'],
    performanceCeilings: ['rich'],
    deviceConfigs: [['desktop']],
  },
  {
    domain: 'CleanTech, Energy Grid & Battery Storage',
    archetypes: ['analytics', 'saas', 'erp-operations'],
    clientProfiles: [
      { name: 'GridVolt Battery Storage', focus: 'Grid-scale lithium iron phosphate battery storage degradation, BESS thermal monitoring, and arbitrage', entities: ['BatteryRack', 'ThermalCoolingLoop', 'WholesalePowerPrice'], workflows: ['Dispatch battery power during peak price spikes', 'Equalize cell voltages across pack racks'] },
      { name: 'Boreas Offshore Wind Farm', focus: 'Deep-water floating wind turbine pitch control, yaw telemetry, and subsea cable integrity', entities: ['TurbineNacelle', 'SubseaCableSensor', 'WindForecast'], workflows: ['Feather turbine blades in gale conditions', 'Inspect acoustic subsea cable health'] },
      { name: 'Solara Distributed Microgrid', focus: 'Commercial rooftop solar microgrid peer-to-peer energy exchange and islanding resilience', entities: ['SolarInverter', 'FacilityLoadMeter', 'P2PEnergyContract'], workflows: ['Island facility from blackout grid', 'Trade surplus solar kilowatt-hours with neighbors'] },
    ],
    feels: ['dense and tactical', 'clean and trustworthy', 'dark and precise'],
    visualAmbitionRange: [35, 70],
    structuralCreativityRange: [25, 55],
    accessibilityFloors: ['AA'],
    performanceCeilings: ['balanced', 'rich'],
    deviceConfigs: [['desktop'], ['desktop', 'tablet']],
  },
  {
    domain: 'EduTech & Adaptive Courseware',
    archetypes: ['education', 'saas', 'consumer'],
    clientProfiles: [
      { name: 'Synapse Adaptive Academy', focus: 'Personalized STEM mastery learning with knowledge graph gap detection and spaced repetition', entities: ['ConceptNode', 'StudentMasteryState', 'PracticeProblem'], workflows: ['Identify prerequisite knowledge gaps', 'Present spaced repetition practice sessions'] },
      { name: 'Codex University Proctored Testing', focus: 'Secure browser sandboxing, automated programming rubric grading, and plagiarism graph analysis', entities: ['CodingExam', 'SubmissionAST', 'SimilarityCluster'], workflows: ['Execute sandboxed code unit tests', 'Flag AST structural plagiarism across submissions'] },
      { name: 'Kalon Language Immersion', focus: 'Speech recognition phonetic accent feedback and live interactive conversational roleplay', entities: ['PhonemePronunciationScore', 'DialogueScenario', 'VocabularyDeck'], workflows: ['Score vocal audio formant frequencies', 'Engage in conversational AI roleplays'] },
    ],
    feels: ['warm and accessible', 'playful and bold', 'clean and trustworthy'],
    visualAmbitionRange: [45, 85],
    structuralCreativityRange: [35, 70],
    accessibilityFloors: ['AA', 'AAA'],
    performanceCeilings: ['balanced', 'rich'],
    deviceConfigs: [['desktop', 'tablet', 'mobile'], ['tablet', 'mobile']],
  },
  {
    domain: 'Real Estate & PropTech Portfolio Intelligence',
    archetypes: ['real-estate', 'analytics', 'saas'],
    clientProfiles: [
      { name: 'Centrum Commercial Asset Management', focus: 'High-rise office building tenant occupancy, lease rollover risk, and ESG carbon emissions', entities: ['CommercialProperty', 'TenantLeaseContract', 'EnergyConsumptionProfile'], workflows: ['Model lease expiration cash flow impacts', 'Audit annual building carbon intensity'] },
      { name: 'Terran Land Acquisition GIS', focus: 'Satellite parcel boundary overlays, municipal zoning restrictions, and tax lien title deed review', entities: ['LandParcel', 'ZoningOverlay', 'TitleDeedHistory'], workflows: ['Overlay wetland and utility easement buffers', 'Calculate residential density yield'] },
      { name: 'Haven Smart Residence Core', focus: 'Multi-family luxury apartment keyless access, package locker notifications, and maintenance triage', entities: ['ApartmentUnit', 'MaintenanceWorkOrder', 'SmartAccessBadge'], workflows: ['Dispatch emergency plumbing technician', 'Grant temporary visitor digital keys'] },
    ],
    feels: ['luxe and editorial', 'clean and trustworthy', 'dense and tactical'],
    visualAmbitionRange: [50, 90],
    structuralCreativityRange: [35, 65],
    accessibilityFloors: ['AA'],
    performanceCeilings: ['balanced', 'rich'],
    deviceConfigs: [['desktop', 'tablet', 'mobile'], ['desktop']],
  },
  {
    domain: 'LegalTech & Contract Intelligence',
    archetypes: ['saas', 'productivity', 'intelligence-research'],
    clientProfiles: [
      { name: 'JurisAI Redline Workspace', focus: 'Multi-party M&A agreement redline comparison, non-standard clause detection, and risk scoring', entities: ['LegalAgreement', 'RedlineComparisonDiff', 'RiskClauseFinding'], workflows: ['Diff conflicting contract revisions', 'Flag indemnification liability caps'] },
      { name: 'LexIntel Intellectual Property', focus: 'Global patent portfolio claims mapping, prior-art citation graphs, and trademark watch alerts', entities: ['PatentClaim', 'PriorArtDocument', 'TrademarkOpposition'], workflows: ['Map patent claim language to competitor products', 'File automated trademark renewals'] },
      { name: 'Tribunal Court Docket Engine', focus: 'Federal appellate court docket filings, judicial ruling sentiment analytics, and deadline calendaring', entities: ['CourtDocketEntry', 'JudicialRulingMetric', 'StatutoryDeadline'], workflows: ['Calculate statutory appeal deadlines', 'Analyze historical judge motion grant rates'] },
    ],
    feels: ['clean and trustworthy', 'dense and tactical', 'luxe and editorial'],
    visualAmbitionRange: [25, 55],
    structuralCreativityRange: [20, 45],
    accessibilityFloors: ['AA', 'AAA'],
    performanceCeilings: ['balanced', 'lightweight'],
    deviceConfigs: [['desktop'], ['desktop', 'tablet']],
  },
  {
    domain: 'Media, Audio & Streaming Production',
    archetypes: ['creator', 'media', 'productivity'],
    clientProfiles: [
      { name: 'Waveform Cloud Studio', focus: 'Browser-based multi-track DAW audio editing, stem separation, and spatial Dolby Atmos mixing', entities: ['AudioStemTrack', 'DSPFilterPlugin', 'MixMaster'], workflows: ['Separate vocal and drum tracks with AI', 'Export lossless broadcast masters'] },
      { name: 'StreamGrid Live Broadcast Matrix', focus: 'Multi-camera cloud video switcher, graphics lower-third overlays, and low-latency WebRTC streams', entities: ['VideoInputFeed', 'LowerThirdGraphic', 'BroadcastProgram'], workflows: ['Switch live camera angles with tally indicators', 'Push RTMP stream to multiple CDN destinations'] },
      { name: 'KinoVault Archival Footage', focus: 'AI facial and scene recognition video archive, rights licensing clearance, and EDL timeline exports', entities: ['FootageClip', 'LicensingRightsContract', 'TimelineExport'], workflows: ['Index historical footage reels', 'Generate license clearance watermarked proxies'] },
    ],
    feels: ['dark and precise', 'luxe and editorial', 'futuristic and sharp'],
    visualAmbitionRange: [65, 95],
    structuralCreativityRange: [50, 90],
    accessibilityFloors: ['AA'],
    performanceCeilings: ['rich'],
    deviceConfigs: [['desktop'], ['desktop', 'tablet']],
  },
  {
    domain: 'Gaming, Esports & Competitive Communities',
    archetypes: ['consumer', 'media', 'community'],
    clientProfiles: [
      { name: 'NexusArena Pro Circuit', focus: 'Competitive esports tournament brackets, double-elimination seedings, and live match stats', entities: ['EsportsMatch', 'TournamentBracket', 'PlayerStatistic'], workflows: ['Generate seed brackets', 'Stream real-time game telemetry'] },
      { name: 'Vanguard Anti-Cheat Watchdog', focus: 'Memory injection heuristic analysis, hardware ban tracking, and replay spectator reports', entities: ['CheatTelemetryFlag', 'HardwareSignature', 'PlayerReplayClip'], workflows: ['Flag impossible aim trajectories', 'Issue machine ID hardware bans'] },
      { name: 'LootHaven Guild Treasury', focus: 'Multi-game guild vault inventory, raid sign-up schedules, and DKP point distribution', entities: ['GuildInventoryItem', 'RaidAttendanceLog', 'LootDistributionRecord'], workflows: ['Schedule 40-player raid rosters', 'Distribute dragon-kill points for boss takedowns'] },
    ],
    feels: ['futuristic and sharp', 'playful and bold', 'dark and precise'],
    visualAmbitionRange: [60, 95],
    structuralCreativityRange: [45, 85],
    accessibilityFloors: ['AA'],
    performanceCeilings: ['rich'],
    deviceConfigs: [['desktop', 'tablet', 'mobile'], ['desktop']],
  },
  {
    domain: 'IoT, Smart Cities & Robotics',
    archetypes: ['analytics', 'erp-operations', 'saas'],
    clientProfiles: [
      { name: 'RoboFleet Warehouse Core', focus: 'Autonomous mobile robot fleet path planning, LiDAR obstacle avoidance, and pallet missions', entities: ['AMRRobot', 'WarehouseGridPath', 'PalletMoveMission'], workflows: ['Resolve AMR path congestion bottlenecks', 'Dispatch robots to high-bay pick stations'] },
      { name: 'UrbanAqua Smart Water Grid', focus: 'Municipal water distribution acoustic leak detection, pipe pressure sensors, and valve controls', entities: ['PressureSensorNode', 'AcousticLeakAnomaly', 'DistributionValve'], workflows: ['Pinpoint subterranean pipe fractures', 'Isolate water mains during contamination events'] },
      { name: 'Metropolis Intelligent Streetlights', focus: 'Smart city streetlight dimming mesh, pedestrian density sensors, and air quality telemetry', entities: ['LightingPoleNode', 'ParticulateAirSensor', 'DimmingScheduleProfile'], workflows: ['Adjust LED lumen output based on foot traffic', 'Alert environmental authorities to PM2.5 spikes'] },
    ],
    feels: ['dense and tactical', 'dark and precise', 'clean and trustworthy'],
    visualAmbitionRange: [35, 75],
    structuralCreativityRange: [30, 60],
    accessibilityFloors: ['AA'],
    performanceCeilings: ['rich', 'balanced'],
    deviceConfigs: [['desktop'], ['desktop', 'tablet']],
  },
  {
    domain: 'HR, People Ops & Global Payroll',
    archetypes: ['saas', 'crm', 'erp-operations'],
    clientProfiles: [
      { name: 'EquiPay Global Remote', focus: 'Cross-border multi-currency contractor payments, statutory local tax withholdings, and EOR contracts', entities: ['GlobalWorker', 'TaxWithholdingForm', 'PayrollDisbursement'], workflows: ['Calculate foreign social contribution levies', 'Wire payroll via local banking rails'] },
      { name: 'TalentRadar 360 Calibration', focus: 'Peer performance review matrix, 9-box talent grid calibration, and executive succession planning', entities: ['ReviewCycle', 'NineBoxRating', 'SuccessionCandidate'], workflows: ['Calibrate department rating distributions', 'Identify high-potential future leadership'] },
      { name: 'VestingVault Equity Grants', focus: 'Stock option cap table modeling, 409A valuations, and employee exercise windows', entities: ['OptionGrant', 'CapTableStakeholder', 'ExerciseTransaction'], workflows: ['Model secondary tender offer dilutions', 'Issue electronic ISO option contracts'] },
    ],
    feels: ['clean and trustworthy', 'warm and accessible', 'calm and clinical'],
    visualAmbitionRange: [30, 60],
    structuralCreativityRange: [20, 50],
    accessibilityFloors: ['AA', 'AAA'],
    performanceCeilings: ['balanced', 'lightweight'],
    deviceConfigs: [['desktop', 'tablet', 'mobile'], ['desktop']],
  },
  {
    domain: 'Construction & Civil Infrastructure',
    archetypes: ['erp-operations', 'saas', 'analytics'],
    clientProfiles: [
      { name: 'StructureBIM Civil Works', focus: '3D IFC Building Information Modeling viewer, clash detection, and architectural change orders', entities: ['BIMElement', 'ClashDetectionReport', 'ArchitecturalChangeOrder'], workflows: ['Detect MEP clashes with structural steel beams', 'Issue subcontractor RFIs with 3D coordinate pins'] },
      { name: 'TerraForge Site Photogrammetry', focus: 'Drone aerial excavation earthwork volumetric calculations, site safety hazards, and daily logs', entities: ['DroneFlyoverScan', 'EarthworkCutFillVolume', 'SafetyIncidentNotice'], workflows: ['Calculate dirt cut-and-fill cubic yards', 'Verify perimeter scaffolding fall-protection netting'] },
      { name: 'Concurrence Concrete Curing', focus: 'Sub-surface embedded thermal sensor maturity curves and concrete compressive strength prediction', entities: ['CuringSensorNode', 'CompressiveStrengthCurve', 'PourBatchTicket'], workflows: ['Monitor hydration thermal runaway risks', 'Authorize early formwork stripping based on maturity'] },
    ],
    feels: ['dense and tactical', 'clean and trustworthy', 'brutalist and raw'],
    visualAmbitionRange: [35, 70],
    structuralCreativityRange: [25, 55],
    accessibilityFloors: ['AA'],
    performanceCeilings: ['rich', 'balanced'],
    deviceConfigs: [['desktop', 'tablet'], ['desktop']],
  },
  {
    domain: 'Automotive Telematics & EV Fleet',
    archetypes: ['analytics', 'saas', 'erp-operations'],
    clientProfiles: [
      { name: 'VoltHaul EV Fleet Dispatch', focus: 'Commercial electric semi-truck battery state-of-health, regenerative braking, and megawatt charging', entities: ['ElectricVehicleTruck', 'BatteryPackState', 'ChargingHubSlot'], workflows: ['Optimize long-haul charging stop itineraries', 'Predict battery cell degradation across temperature extremes'] },
      { name: 'DriveSafe Telematics Insurance', focus: 'OBD-II CAN bus harsh braking telemetry, cornering G-force analytics, and dynamic actuarial premiums', entities: ['TripTelemetryEvent', 'DriverRiskScore', 'PremiumAdjustment'], workflows: ['Score commercial fleet safety records', 'Apply defensive driver insurance discounts'] },
      { name: 'OmniTransit Micro-Mobility', focus: 'Shared e-bike and scooter geofencing, street battery swapper dispatch, and slow-speed zone enforcement', entities: ['MicroVehicleScooter', 'GeofenceSpeedZone', 'BatteryRechargeJob'], workflows: ['Enforce pedestrian zone speed limit caps', 'Route mobile van drivers to depleted vehicle batteries'] },
    ],
    feels: ['dense and tactical', 'futuristic and sharp', 'clean and trustworthy'],
    visualAmbitionRange: [40, 75],
    structuralCreativityRange: [30, 60],
    accessibilityFloors: ['AA'],
    performanceCeilings: ['rich', 'balanced'],
    deviceConfigs: [['desktop', 'tablet', 'mobile'], ['mobile']],
  },
  {
    domain: 'Creative Studios, Typography & Asset Warehousing',
    archetypes: ['creator', 'marketplace', 'productivity'],
    clientProfiles: [
      { name: 'GlyphSmith Foundry Workspace', focus: 'OpenType variable font glyph bezier curve design, kerning pair matrices, and commercial licensing', entities: ['FontFamily', 'GlyphBezierMaster', 'FontLicenseContract'], workflows: ['Test variable optical weight axes', 'Generate web font WOFF2 bundles with license watermarks'] },
      { name: 'PrismRender 3D Shader Hub', focus: 'Physically based rendering (PBR) procedural texture authoring, normal maps, and real-time preview', entities: ['PBRMaterial', 'TextureChannelMap', 'MaterialPresetCollection'], workflows: ['Tweak metallic roughness scattering parameters', 'Export 8K texture packs for Unreal Engine'] },
      { name: 'Atelier Brand Asset Portal', focus: 'Enterprise global brand guideline enforcement, SVG vector logo versioning, and press kit kits', entities: ['BrandAssetLogo', 'ColorPaletteSpec', 'PressKitBundle'], workflows: ['Approve agency co-branding proposals', 'Download localized CMYK print vector assets'] },
    ],
    feels: ['luxe and editorial', 'brutalist and raw', 'playful and bold'],
    visualAmbitionRange: [65, 95],
    structuralCreativityRange: [45, 85],
    accessibilityFloors: ['AA'],
    performanceCeilings: ['rich'],
    deviceConfigs: [['desktop'], ['desktop', 'tablet']],
  },
  {
    domain: 'Web3, Protocol Governance & Treasuries',
    archetypes: ['fintech', 'productivity', 'saas'],
    clientProfiles: [
      { name: 'AethelDAO Treasury Council', focus: 'Decentralized autonomous organization multi-sig quorum voting, timelock contracts, and grant allocations', entities: ['GovernanceProposal', 'TimelockTransaction', 'TreasuryVault'], workflows: ['Queue proposal timelock execution', 'Distribute ecosystem development grants'] },
      { name: 'Bifrost Bridge Liquidity Engine', focus: 'Cross-chain zero-knowledge light client proof verification, liquidity rebalancing, and relayer fee telemetry', entities: ['ZKBridgeProof', 'CrossChainTransfer', 'RelayerFeeMetric'], workflows: ['Verify optimistic fraud challenge proofs', 'Rebalance stablecoin pools across Layer 2 rollups'] },
      { name: 'FormalGuard Smart Contract Verifier', focus: 'EVM bytecode symbolic execution, reentrancy vulnerability detection, and mathematical proof certificates', entities: ['SmartContractArtifact', 'SymbolicTraceFinding', 'FormalProofCertificate'], workflows: ['Run automated bytecode fuzzing tests', 'Certify flash-loan attack immunity'] },
    ],
    feels: ['dark and precise', 'futuristic and sharp', 'dense and technical'],
    visualAmbitionRange: [50, 90],
    structuralCreativityRange: [35, 75],
    accessibilityFloors: ['AA'],
    performanceCeilings: ['rich', 'balanced'],
    deviceConfigs: [['desktop'], ['desktop', 'tablet', 'mobile']],
  },
  {
    domain: 'Non-Profit & Humanitarian Aid Delivery',
    archetypes: ['saas', 'crm', 'erp-operations'],
    clientProfiles: [
      { name: 'Aegis Relief Cargo Logistics', focus: 'Conflict zone humanitarian refugee camp food ration dispatches, satellite communications, and water filtration', entities: ['AidConvoy', 'RefugeeRationBundle', 'FieldHospitalResource'], workflows: ['Coordinate demilitarized convoy travel clearances', 'Track water purification tablet supply levels'] },
      { name: 'Solaris Global Literacy Fund', focus: 'Low-bandwidth digital textbook distribution, offline solar tablet syncs, and community teacher stipends', entities: ['LiteracyCurriculum', 'OfflineDeviceProfile', 'TeacherStipendRecord'], workflows: ['Sync offline reading progress via Bluetooth mesh', 'Distribute mobile money stipends to village educators'] },
      { name: 'Veritas Eco-Conservation Watch', focus: 'Anti-poaching wildlife acoustic sensor triangulation, drone thermal patrols, and endangered species counts', entities: ['WildlifeSensorAudio', 'RangerPatrolRoster', 'SpeciesSightingRecord'], workflows: ['Triangulate acoustic gunshot bearings', 'Dispatch rapid response ranger teams to protected sanctuaries'] },
    ],
    feels: ['warm and accessible', 'clean and trustworthy', 'calm and clinical'],
    visualAmbitionRange: [25, 55],
    structuralCreativityRange: [20, 45],
    accessibilityFloors: ['AA', 'AAA'],
    performanceCeilings: ['lightweight', 'balanced'],
    deviceConfigs: [['desktop', 'tablet', 'mobile'], ['mobile']],
  },
  {
    domain: 'Hospitality & Luxury Travel Concierge',
    archetypes: ['travel', 'creator', 'consumer'],
    clientProfiles: [
      { name: 'Aura Private Jet Charter', focus: 'On-demand private aviation empty-leg routing, customs passenger manifests, and catering preferences', entities: ['AircraftTailNumber', 'FlightCharterQuote', 'PassengerConciergeRequest'], workflows: ['Quote bespoke transcontinental flights', 'Coordinate airport tarmac VIP limousine escort'] },
      { name: 'Monaco Superyacht Syndicate', focus: 'Mediterranean megayacht berth allocations, crew payroll certifications, and maritime provisioning', entities: ['SuperyachtVessel', 'MarinaBerthReservation', 'CrewWorkRoster'], workflows: ['Reserve peak-season Monaco Grand Prix berths', 'Order fine vintage provisions for guest cruises'] },
      { name: 'Sanctuary Safari Lodges', focus: 'African wilderness luxury eco-camp reservations, bush pilot transfers, and private game drive itineraries', entities: ['SafariLodgeSuite', 'BushPlaneLeg', 'GuestItinerarySchedule'], workflows: ['Curate bespoke migration viewing schedules', 'Coordinate private air strip transfers'] },
    ],
    feels: ['luxe and editorial', 'warm and accessible', 'clean and trustworthy'],
    visualAmbitionRange: [65, 95],
    structuralCreativityRange: [40, 80],
    accessibilityFloors: ['AA'],
    performanceCeilings: ['rich', 'balanced'],
    deviceConfigs: [['desktop', 'tablet', 'mobile'], ['mobile']],
  },
  {
    domain: 'Pharmaceuticals & Clinical Trials',
    archetypes: ['intelligence-research', 'saas', 'analytics'],
    clientProfiles: [
      { name: 'BioPharm Phase III Trial Network', focus: 'Double-blind multi-center clinical drug trial patient recruitment, electronic data capture, and audit logs', entities: ['ClinicalTrialSubject', 'CaseReportForm', 'AdverseEventFiling'], workflows: ['Validate electronic case report forms', 'Escalate serious adverse reaction reports to the FDA'] },
      { name: 'MedDRA Pharmacovigilance Engine', focus: 'Global spontaneous drug reaction mining, signal detection algorithms, and regulatory periodic safety reports', entities: ['SafetySignalCandidate', 'DisproportionalityScore', 'RegulatoryDossier'], workflows: ['Calculate proportional reporting ratios', 'Generate automated European Medicines Agency periodic reports'] },
      { name: 'ColdVax Lyophilization Stability', focus: 'Biologic drug formulation shelf-life degradation, glass vial container closure integrity, and freeze-thaw cycles', entities: ['DrugBatchVial', 'StabilityStudyTimepoint', 'AggregatedProteinPurity'], workflows: ['Plot accelerated temperature stability kinetics', 'Verify sterile seal container integrity'] },
    ],
    feels: ['calm and clinical', 'dense and technical', 'clean and trustworthy'],
    visualAmbitionRange: [30, 60],
    structuralCreativityRange: [20, 50],
    accessibilityFloors: ['AA', 'AAA'],
    performanceCeilings: ['balanced', 'rich'],
    deviceConfigs: [['desktop'], ['desktop', 'tablet']],
  },
  {
    domain: 'Telecommunications & Optical Networks',
    archetypes: ['analytics', 'developer-tools', 'saas'],
    clientProfiles: [
      { name: 'AethelFiber Submarine Cables', focus: 'Transoceanic optical submarine cable optical time-domain reflectometry, repeater voltage, and capacity leasing', entities: ['SubseaFiberSpan', 'OpticalRepeaterState', 'WavelengthLeaseContract'], workflows: ['Localize subsea fiber optic micro-bends', 'Re-route petabit traffic around seabed seismic events'] },
      { name: 'TelcoCore 5G Standalone Slicing', focus: '5G core network slice SLA latency guarantees, gNodeB beamforming telemetry, and subscriber QoS priority', entities: ['NetworkSliceInstance', 'BaseStationCell', 'SubscriberQoSPolicy'], workflows: ['Provision ultra-reliable low-latency slices for surgery', 'Rebalance sector antenna radio beam tilts'] },
      { name: 'EquiPeering Internet Exchange', focus: 'Major metropolitan BGP peering route server telemetry, DDoS scrubbing thresholds, and port cross-connects', entities: ['BGPPeerSession', 'DDoSMitigationFilter', 'PhysicalCrossConnect'], workflows: ['Filter spoofed AS path prefix advertisements', 'Engage upstream scrubbing centers during volumetric attacks'] },
    ],
    feels: ['dense and technical', 'dark and precise', 'futuristic and sharp'],
    visualAmbitionRange: [40, 80],
    structuralCreativityRange: [30, 65],
    accessibilityFloors: ['AA'],
    performanceCeilings: ['rich', 'balanced'],
    deviceConfigs: [['desktop'], ['desktop', 'tablet']],
  },
  {
    domain: 'Industrial Automation & Robotics',
    archetypes: ['erp-operations', 'analytics', 'saas'],
    clientProfiles: [
      { name: 'CyberFab Semiconductor Foundry', focus: 'Extreme ultraviolet lithography wafer track yield analysis, particle contamination, and stepper uptime', entities: ['SiliconWaferLot', 'ParticleDefectScan', 'StepperEquipment'], workflows: ['Quarantine defective silicon wafer runs', 'Schedule laser source plasma re-calibration'] },
      { name: 'KUKA Assembly Precision Arm Core', focus: 'Automotive robotic spot-welding torque telemetry, vibrational acoustic wear, and preventive motor swaps', entities: ['RoboticArmJoint', 'VibrationFFTSpectrum', 'PreventiveMaintenanceTask'], workflows: ['Analyze harmonic bearing gear wear', 'Push automated toolpath G-code adjustments'] },
      { name: 'ChemicalPlant Process Safety SCADA', focus: 'Continuous exothermic distillation column pressure relief systems, HAZOP interlocks, and flare stack emission', entities: ['ReactorVessel', 'SafetyInterlockValve', 'FlareEmissionTelemetry'], workflows: ['Trip safety emergency shutdown systems', 'Audit flare stack VOC destruction efficiency'] },
    ],
    feels: ['dense and tactical', 'dark and precise', 'brutalist and raw'],
    visualAmbitionRange: [35, 70],
    structuralCreativityRange: [25, 55],
    accessibilityFloors: ['AA'],
    performanceCeilings: ['rich', 'balanced'],
    deviceConfigs: [['desktop'], ['desktop', 'tablet']],
  },
  {
    domain: 'Agriculture & Precision Farming',
    archetypes: ['analytics', 'saas', 'erp-operations'],
    clientProfiles: [
      { name: 'TerraCrop Autonomous Fleet', focus: 'Autonomous electric combine harvester RTK GPS field navigation, grain yield mapping, and soil compaction', entities: ['AutonomousHarvester', 'CropYieldMapCell', 'FieldBoundaryPolygon'], workflows: ['Generate obstacle-free combine headland turn paths', 'Map field moisture variations during harvest'] },
      { name: 'VerdantHydro Vertical Aeroponics', focus: 'Indoor vertical farm closed-loop nutrient dosing, spectrum LED photon flux tuning, and root misting cycles', entities: ['AeroponicStackBay', 'NutrientDosingSolution', 'LEDLightRecipe'], workflows: ['Adjust blue/red photon ratios for basil growth', 'Trigger high-pressure atomized root nutrient pulses'] },
      { name: 'AquaPasture Livestock Bio-Telemetry', focus: 'Free-range cattle ear-tag rumination acoustic monitoring, heat cycle detection, and virtual pasture geofences', entities: ['CattleEarTag', 'RuminationHourMetric', 'VirtualFenceBoundary'], workflows: ['Detect bovine illness from rumination drops', 'Shift herd grazing sectors using gentle collar audio cues'] },
    ],
    feels: ['clean and trustworthy', 'warm and accessible', 'dense and tactical'],
    visualAmbitionRange: [30, 65],
    structuralCreativityRange: [25, 50],
    accessibilityFloors: ['AA'],
    performanceCeilings: ['balanced', 'rich'],
    deviceConfigs: [['desktop', 'tablet', 'mobile'], ['tablet', 'mobile']],
  },
  {
    domain: 'Insurance & Actuarial Risk Intelligence',
    archetypes: ['analytics', 'fintech', 'saas'],
    clientProfiles: [
      { name: 'AegisRe Catastrophe Retrocession', focus: 'Atlantic hurricane storm surge hydrodynamic inundation modeling, treaty loss distribution, and capital solvency', entities: ['CatastropheEventScenario', 'ReinsuranceTreaty', 'ExceedanceProbabilityCurve'], workflows: ['Simulate Category 5 hurricane landfalls', 'Calculate probable maximum treaty losses'] },
      { name: 'OmniRisk Commercial Cyber Underwriting', focus: 'Continuous enterprise external vulnerability surface scanning, ransomware exposure, and loss adjusters', entities: ['InsuredCompany', 'RansomwareRiskFinding', 'ClaimReserveAmount'], workflows: ['Price parametric cyber interruption policies', 'Verify multi-factor authentication compliance'] },
      { name: 'VitalLife Actuarial Longevity Models', focus: 'National demographic mortality cohorts, annuity pension longevity risk hedging, and interest rate immunization', entities: ['MortalityCohortTable', 'AnnuityObligationBook', 'DurationMatchHedge'], workflows: ['Stress test longevity tables for medical breakthroughs', 'Immunize pension liabilities against rate shifts'] },
    ],
    feels: ['dense and tactical', 'clean and trustworthy', 'dark and precise'],
    visualAmbitionRange: [25, 55],
    structuralCreativityRange: [20, 45],
    accessibilityFloors: ['AA', 'AAA'],
    performanceCeilings: ['balanced', 'lightweight'],
    deviceConfigs: [['desktop'], ['desktop', 'tablet']],
  },
  {
    domain: 'Consumer Productivity & Knowledge Graph',
    archetypes: ['productivity', 'consumer', 'creator'],
    clientProfiles: [
      { name: 'Chronos Bidirectional Synapse', focus: 'Graph-based personal thought notebook, backlinks, markdown canvas, and daily habit journal', entities: ['ThoughtNote', 'BacklinkRelation', 'DailyFocusJournal'], workflows: ['Explore visual graph node connections', 'Capture distraction-free markdown ideas'] },
      { name: 'DeepFlow Ambient Workspace', focus: 'Binaural beats focus timer, task kanban board, and screen time distraction shields', entities: ['FocusSessionBlock', 'KanbanTaskCard', 'DistractionShieldRule'], workflows: ['Initiate 90-minute deep work intervals', 'Block cognitive distractors across devices'] },
      { name: 'FireCalc Independence Modeler', focus: 'Personal financial independence retirement simulation, safe withdrawal rates, and tax asset allocations', entities: ['AssetAllocationAccount', 'MonteCarloRetirementRun', 'ExpenseBudgetProjection'], workflows: ['Model variable safe withdrawal drawdown rates', 'Optimize tax-advantaged account conversion ladders'] },
    ],
    feels: ['calm and clinical', 'warm and accessible', 'luxe and editorial', 'brutalist and raw'],
    visualAmbitionRange: [40, 85],
    structuralCreativityRange: [35, 80],
    accessibilityFloors: ['AA'],
    performanceCeilings: ['balanced', 'rich'],
    deviceConfigs: [['desktop', 'tablet', 'mobile'], ['desktop'], ['mobile']],
  },
  {
    domain: 'Public Health & Epidemiological Surveillance',
    archetypes: ['analytics', 'intelligence-research', 'saas'],
    clientProfiles: [
      { name: 'PathoScan Wastewater Genomics', focus: 'Municipal wastewater pathogen genomic sequencing, viral variant prevalence, and localized outbreak warnings', entities: ['WastewaterTreatmentCatchment', 'ViralVariantSequence', 'CommunityInfectionAlert'], workflows: ['Sequence community SARS-CoV-2 / Influenza RNA copies', 'Dispatch early viral spike notifications to municipal hospitals'] },
      { name: 'VectorWatch Mosquito Eradication', focus: 'Arbovirus vector mosquito trap sensor telemetry, Wolbachia release schedules, and rainfall prediction', entities: ['MosquitoTrapNode', 'ViralPCRAssay', 'BioReleaseRoute'], workflows: ['Map Aedes aegypti vector population density', 'Release Wolbachia-carrying biocontrol mosquitoes'] },
      { name: 'GlobalVaccine Cold Chain Monitor', focus: 'WHO PQS certified ultralow temperature vaccine freezer telemetry, remote off-grid clinics, and expiration audit', entities: ['CryoFreezerUnit', 'VaccineVialDoseBatch', 'TemperatureExcursionIncident'], workflows: ['Audit ultralow -80C cold chain compliance', 'Reallocate near-expiry vaccine lots to active vaccination clinics'] },
    ],
    feels: ['calm and clinical', 'clean and trustworthy', 'dense and technical'],
    visualAmbitionRange: [30, 65],
    structuralCreativityRange: [20, 50],
    accessibilityFloors: ['AAA', 'AA'],
    performanceCeilings: ['lightweight', 'balanced'],
    deviceConfigs: [['desktop', 'tablet', 'mobile'], ['desktop']],
  },
];

/**
 * Deterministically generates exactly 1,000 distinct, rich, realistic client scenarios.
 */
export function generate1000ClientScenarios(): ClientScenario[] {
  const scenarios: ClientScenario[] = [];
  const totalTarget = 1000;

  let globalIndex = 0;

  // We loop deterministically through our 32 domains
  while (scenarios.length < totalTarget) {
    const domainIdx = globalIndex % DOMAIN_TEMPLATES.length;
    const template = DOMAIN_TEMPLATES[domainIdx]!;
    const profileIdx = Math.floor(globalIndex / DOMAIN_TEMPLATES.length) % template.clientProfiles.length;
    const profile = template.clientProfiles[profileIdx]!;
    
    const archetypeIdx = (globalIndex + profileIdx) % template.archetypes.length;
    const archetypeExpected = template.archetypes[archetypeIdx]!;

    const feelIdx = (globalIndex * 7) % template.feels.length;
    const feel = template.feels[feelIdx]!;

    const vaMin = template.visualAmbitionRange[0];
    const vaMax = template.visualAmbitionRange[1];
    const visualAmbition = vaMin + ((globalIndex * 13) % (vaMax - vaMin + 1));

    const scMin = template.structuralCreativityRange[0];
    const scMax = template.structuralCreativityRange[1];
    const structuralCreativity = scMin + ((globalIndex * 17) % (scMax - scMin + 1));

    const a11yIdx = (globalIndex * 3) % template.accessibilityFloors.length;
    const accessibilityFloor = template.accessibilityFloors[a11yIdx]!;

    const perfIdx = (globalIndex * 5) % template.performanceCeilings.length;
    const performanceCeiling = template.performanceCeilings[perfIdx]!;

    const devIdx = (globalIndex * 11) % template.deviceConfigs.length;
    const targetDevices = template.deviceConfigs[devIdx]!;

    const variationId = Math.floor(globalIndex / (DOMAIN_TEMPLATES.length * template.clientProfiles.length)) + 1;
    const clientTitle = variationId > 1 ? `${profile.name} Tier ${variationId}` : profile.name;

    const description = `A mission-critical ${template.domain.toLowerCase()} system for ${clientTitle}. Core specialization: ${profile.focus}. Primary data entities: ${profile.entities.join(', ')}. Key operational workflows: ${profile.workflows.join(', ')}. Must operate with high reliability and comply with strict domain standards.`;

    const id = `client-scen-${String(globalIndex + 1).padStart(4, '0')}`;

    scenarios.push({
      id,
      index: globalIndex + 1,
      domain: template.domain,
      archetypeExpected,
      title: `${clientTitle} — ${profile.focus.slice(0, 40)}`,
      description,
      feel,
      visualAmbition,
      structuralCreativity,
      accessibilityFloor,
      performanceCeiling,
      targetDevices,
    });

    globalIndex++;
  }

  return scenarios;
}
