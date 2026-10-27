import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Department from '../models/Department.js';
import FacultyProfile from '../models/FacultyProfile.js';
import Publication from '../models/Publication.js';
import Achievement from '../models/Achievement.js';
import ResearchProject from '../models/ResearchProject.js';
import AdvancementPolicy from '../models/AdvancementPolicy.js';
import Notification from '../models/Notification.js';
import Facility from '../models/Facility.js';
import { ROLES, USER_STATUS, VERIFICATION_STATUSES } from '../config/constants.js';

export const seedDatabaseIfEmpty = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log(`[Seed] Database already contains ${userCount} users. Skipping auto-seed.`);
      return;
    }

    console.log(`[Seed] Empty database detected. Populating institutional demo dataset...`);
    await runSeed();
  } catch (err) {
    console.error(`[Seed] Error checking or seeding database:`, err.message);
  }
};

export const runSeed = async () => {
  console.log(`[Seed] Starting seed process...`);

  // 1. Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Department.deleteMany({}),
    FacultyProfile.deleteMany({}),
    Publication.deleteMany({}),
    Achievement.deleteMany({}),
    ResearchProject.deleteMany({}),
    AdvancementPolicy.deleteMany({}),
    Notification.deleteMany({}),
    Facility.deleteMany({}),
  ]);

  // 2. Create Departments
  const deptCSE = await Department.create({
    name: 'Computer Science & Engineering',
    code: 'CSE',
    description: 'Department of Computer Science & Engineering, Distributed Computing and Software Systems',
    isActive: true,
  });

  const deptECE = await Department.create({
    name: 'Electronics & Communication Engineering',
    code: 'ECE',
    description: 'Department of Electronics, Signal Processing, 5G Communications, and Embedded VLSI Systems',
    isActive: true,
  });

  const deptDSAI = await Department.create({
    name: 'Data Science & Artificial Intelligence',
    code: 'DSAI',
    description: 'Specialized Center for Machine Learning, Generative AI, Data Analytics and Intelligent Systems',
    isActive: true,
  });

  const deptMECH = await Department.create({
    name: 'Mechanical Engineering',
    code: 'MECH',
    description: 'Department of Thermal Sciences, Robotics, CAD/CAM, and Advanced Additive Manufacturing',
    isActive: true,
  });

  console.log(`[Seed] Created 4 departments.`);

  // 3. Create Users (Admin, HODs, and 10 Faculty Members)
  const adminUser = await User.create({
    name: 'Dr. Rajesh Verma (Dean / Admin)',
    email: 'admin@institution.edu',
    facultyId: 'ADM001',
    password: 'Password@123',
    role: ROLES.ADMIN,
    status: USER_STATUS.ACTIVE,
    designation: 'Dean / Director',
    department: deptCSE._id,
  });

  const reviewerUser = await User.create({
    name: 'Prof. Ramesh Kulkarni (HOD CSE)',
    email: 'hod.cse@institution.edu',
    facultyId: 'HOD201',
    password: 'Password@123',
    role: ROLES.REVIEWER,
    status: USER_STATUS.ACTIVE,
    designation: 'Professor & Head',
    department: deptCSE._id,
  });

  deptCSE.head = reviewerUser._id;
  await deptCSE.save();

  // Faculty User 1 - Dr. Aarav Sharma (CSE)
  const f1 = await User.create({
    name: 'Dr. Aarav Sharma',
    email: 'dr.sharma@institution.edu',
    facultyId: 'FAC101',
    password: 'Password@123',
    role: ROLES.FACULTY,
    status: USER_STATUS.ACTIVE,
    designation: 'Associate Professor',
    department: deptCSE._id,
  });

  // Faculty User 2 - Dr. Ananya Iyer (DSAI)
  const f2 = await User.create({
    name: 'Dr. Ananya Iyer',
    email: 'dr.ananya@institution.edu',
    facultyId: 'FAC102',
    password: 'Password@123',
    role: ROLES.FACULTY,
    status: USER_STATUS.ACTIVE,
    designation: 'Assistant Professor',
    department: deptDSAI._id,
  });

  // Faculty User 3 - Prof. Vikram Nair (ECE)
  const f3 = await User.create({
    name: 'Prof. Vikram Nair',
    email: 'prof.vikram@institution.edu',
    facultyId: 'FAC103',
    password: 'Password@123',
    role: ROLES.FACULTY,
    status: USER_STATUS.ACTIVE,
    designation: 'Professor',
    department: deptECE._id,
  });

  // Faculty User 4 - Dr. Neha Sengupta (MECH)
  const f4 = await User.create({
    name: 'Dr. Neha Sengupta',
    email: 'dr.neha@institution.edu',
    facultyId: 'FAC104',
    password: 'Password@123',
    role: ROLES.FACULTY,
    status: USER_STATUS.ACTIVE,
    designation: 'Associate Professor',
    department: deptMECH._id,
  });

  // Faculty User 5 - Dr. Rajeshwar Rao (ECE)
  const f5 = await User.create({
    name: 'Dr. Rajeshwar Rao',
    email: 'dr.rajeshwar@institution.edu',
    facultyId: 'FAC105',
    password: 'Password@123',
    role: ROLES.FACULTY,
    status: USER_STATUS.ACTIVE,
    designation: 'Associate Professor',
    department: deptECE._id,
  });

  // Faculty User 6 - Dr. Sneha Pillai (DSAI)
  const f6 = await User.create({
    name: 'Dr. Sneha Pillai',
    email: 'dr.sneha@institution.edu',
    facultyId: 'FAC106',
    password: 'Password@123',
    role: ROLES.FACULTY,
    status: USER_STATUS.ACTIVE,
    designation: 'Assistant Professor',
    department: deptDSAI._id,
  });

  // Faculty User 7 - Dr. Arvind Swaminathan (CSE)
  const f7 = await User.create({
    name: 'Dr. Arvind Swaminathan',
    email: 'dr.arvind@institution.edu',
    facultyId: 'FAC107',
    password: 'Password@123',
    role: ROLES.FACULTY,
    status: USER_STATUS.ACTIVE,
    designation: 'Assistant Professor',
    department: deptCSE._id,
  });

  // Faculty User 8 - Dr. Kavita Deshmukh (MECH)
  const f8 = await User.create({
    name: 'Dr. Kavita Deshmukh',
    email: 'dr.kavita@institution.edu',
    facultyId: 'FAC108',
    password: 'Password@123',
    role: ROLES.FACULTY,
    status: USER_STATUS.ACTIVE,
    designation: 'Professor',
    department: deptMECH._id,
  });

  // Faculty User 9 - Dr. Priya Sundaram (ECE)
  const f9 = await User.create({
    name: 'Dr. Priya Sundaram',
    email: 'dr.priya@institution.edu',
    facultyId: 'FAC109',
    password: 'Password@123',
    role: ROLES.FACULTY,
    status: USER_STATUS.ACTIVE,
    designation: 'Assistant Professor',
    department: deptECE._id,
  });

  // Faculty User 10 - Dr. Manoj Mukhopadhyay (DSAI)
  const f10 = await User.create({
    name: 'Dr. Manoj Mukhopadhyay',
    email: 'dr.manoj@institution.edu',
    facultyId: 'FAC110',
    password: 'Password@123',
    role: ROLES.FACULTY,
    status: USER_STATUS.ACTIVE,
    designation: 'Professor',
    department: deptDSAI._id,
  });

  console.log(`[Seed] Created 12 users across Admin, Reviewer, and Faculty roles.`);

  // 4. Create Detailed Faculty Profiles
  await FacultyProfile.create([
    {
      user: f1._id,
      facultyId: f1.facultyId,
      fullName: f1.name,
      officialEmail: f1.email,
      phoneNumber: '+91 98450 12345',
      department: deptCSE._id,
      designation: f1.designation,
      dateOfJoining: new Date('2019-07-15'),
      highestQualification: 'Ph.D. in Computer Science (IISc Bangalore)',
      specialization: 'Distributed Systems & Cloud Computing',
      researchInterests: ['Federated Learning', 'Edge Computing', 'Microservice Architectures', 'Fault Tolerance'],
      orcidId: '0000-0002-1825-0097',
      googleScholarUrl: 'https://scholar.google.com/citations?user=sample123',
      scopusId: '57210984321',
      biography: 'Dr. Aarav Sharma is an Associate Professor in Computer Science & Engineering with over 10 years of research and pedagogical experience. He has published over 25 Scopus-indexed research articles.',
      completionPercentage: 92,
      experience: [
        { title: 'Associate Professor', organization: 'Apex Institute of Technology & Research', startYear: '2022', endYear: 'Present', isCurrent: true, roleDescription: 'Leading Cloud & Distributed Systems Research Group' },
        { title: 'Assistant Professor', organization: 'National Institute of Engineering', startYear: '2016', endYear: '2022', isCurrent: false, roleDescription: 'Taught operating systems and concurrent programming' }
      ],
      coursesTaught: [
        { courseCode: 'CS601', courseName: 'Distributed Systems & Cloud Computing', academicYear: '2024-2025', level: 'Postgraduate' },
        { courseCode: 'CS402', courseName: 'Advanced Operating Systems', academicYear: '2024-2025', level: 'Undergraduate' }
      ]
    },
    {
      user: f2._id,
      facultyId: f2.facultyId,
      fullName: f2.name,
      officialEmail: f2.email,
      phoneNumber: '+91 98450 67890',
      department: deptDSAI._id,
      designation: f2.designation,
      dateOfJoining: new Date('2021-01-10'),
      highestQualification: 'Ph.D. in Artificial Intelligence (IIT Madras)',
      specialization: 'Deep Learning & Natural Language Processing',
      researchInterests: ['Large Language Models', 'Multilingual NLP', 'Explainable AI', 'Biomedical Informatics'],
      orcidId: '0000-0003-9988-1122',
      googleScholarUrl: 'https://scholar.google.com/citations?user=ananya_ai',
      scopusId: '57199887766',
      biography: 'Dr. Ananya Iyer specializes in transformer architectures and natural language understanding for Indic languages. She leads the Generative AI student incubation group.',
      completionPercentage: 88,
      coursesTaught: [
        { courseCode: 'AI501', courseName: 'Deep Learning Architectures', academicYear: '2024-2025', level: 'Undergraduate' }
      ]
    },
    {
      user: f3._id,
      facultyId: f3.facultyId,
      fullName: f3.name,
      officialEmail: f3.email,
      phoneNumber: '+91 98450 33445',
      department: deptECE._id,
      designation: f3.designation,
      dateOfJoining: new Date('2015-08-01'),
      highestQualification: 'Ph.D. in Microelectronics (IIT Delhi)',
      specialization: 'VLSI Design & Embedded Systems',
      researchInterests: ['Low-Power VLSI', 'System-on-Chip (SoC)', 'FPGA Prototyping', 'Radiation-Hardened Circuits'],
      orcidId: '0000-0001-5544-3322',
      googleScholarUrl: 'https://scholar.google.com/citations?user=vikram_nair',
      scopusId: '57100223344',
      biography: 'Prof. Vikram Nair is a senior IEEE member and consultant to several semiconductor enterprises. He has mentored 6 doctoral candidates in sub-nanometer chip layout and digital testability.',
      completionPercentage: 94,
      coursesTaught: [
        { courseCode: 'EC701', courseName: 'CMOS VLSI Design', academicYear: '2024-2025', level: 'Undergraduate' }
      ]
    },
    {
      user: f4._id,
      facultyId: f4.facultyId,
      fullName: f4.name,
      officialEmail: f4.email,
      phoneNumber: '+91 98450 44556',
      department: deptMECH._id,
      designation: f4.designation,
      dateOfJoining: new Date('2018-06-20'),
      highestQualification: 'Ph.D. in Thermal Science (IIT Kharagpur)',
      specialization: 'Renewable Energy & Computational Fluid Dynamics',
      researchInterests: ['Thermal Energy Storage', 'Phase Change Materials', 'CFD Heat Transfer', 'EV Battery Cooling'],
      orcidId: '0000-0002-7788-9900',
      scopusId: '57200445566',
      biography: 'Dr. Neha Sengupta conducts fundamental experimental research in passive cooling for electric vehicle battery packs and solar thermal concentrators.',
      completionPercentage: 86
    },
    {
      user: f5._id,
      facultyId: f5.facultyId,
      fullName: f5.name,
      officialEmail: f5.email,
      phoneNumber: '+91 98450 55667',
      department: deptECE._id,
      designation: f5.designation,
      dateOfJoining: new Date('2020-03-15'),
      highestQualification: 'Ph.D. in Wireless Communications (IISc)',
      specialization: '5G/6G Networks & Massive MIMO',
      researchInterests: ['Terahertz Communications', 'Signal Processing', 'Cognitive Radio', 'Open RAN'],
      orcidId: '0000-0003-2233-4455',
      scopusId: '57211556677',
      biography: 'Dr. Rajeshwar Rao leads research initiatives on massive MIMO beamforming algorithms and intelligent reflecting surfaces for next-generation telecommunication protocols.',
      completionPercentage: 90
    },
    {
      user: f6._id,
      facultyId: f6.facultyId,
      fullName: f6.name,
      officialEmail: f6.email,
      phoneNumber: '+91 98450 66778',
      department: deptDSAI._id,
      designation: f6.designation,
      dateOfJoining: new Date('2022-08-01'),
      highestQualification: 'Ph.D. in Computer Science (NTU Singapore)',
      specialization: 'AI for Healthcare & Clinical Decision Support',
      researchInterests: ['Medical Image Segmentation', 'Graph Neural Networks', 'Multimodal Diagnostics', 'Bio-Signal Processing'],
      orcidId: '0000-0001-9988-7766',
      scopusId: '57222667788',
      biography: 'Dr. Sneha Pillai develops clinical AI models deployed in collaborative hospitals for early diabetic retinopathy detection and radiology workflow automation.',
      completionPercentage: 85
    },
    {
      user: f7._id,
      facultyId: f7.facultyId,
      fullName: f7.name,
      officialEmail: f7.email,
      phoneNumber: '+91 98450 77889',
      department: deptCSE._id,
      designation: f7.designation,
      dateOfJoining: new Date('2021-09-01'),
      highestQualification: 'Ph.D. in Cybersecurity (IIT Roorkee)',
      specialization: 'Cryptography & Blockchain Security',
      researchInterests: ['Zero-Knowledge Proofs', 'Smart Contract Auditing', 'Post-Quantum Cryptography', 'Privacy Preserving ML'],
      orcidId: '0000-0002-3344-5566',
      scopusId: '57233778899',
      biography: 'Dr. Arvind Swaminathan is an active contributor to open-source cryptographic libraries and consults for fintech banking consortia on distributed ledger auditability.',
      completionPercentage: 89
    },
    {
      user: f8._id,
      facultyId: f8.facultyId,
      fullName: f8.name,
      officialEmail: f8.email,
      phoneNumber: '+91 98450 88990',
      department: deptMECH._id,
      designation: f8.designation,
      dateOfJoining: new Date('2014-04-12'),
      highestQualification: 'Ph.D. in Robotics (University of Stuttgart)',
      specialization: 'Robotics, Mechatronics & Additive Manufacturing',
      researchInterests: ['Industrial Manipulators', 'Soft Robotics', 'Direct Metal Laser Sintering', 'Autonomous Navigation'],
      orcidId: '0000-0001-4455-6677',
      scopusId: '57244889900',
      biography: 'Dr. Kavita Deshmukh has over 18 years of academic leadership in manufacturing automation and robotic precision tooling.',
      completionPercentage: 95
    },
    {
      user: f9._id,
      facultyId: f9.facultyId,
      fullName: f9.name,
      officialEmail: f9.email,
      phoneNumber: '+91 98450 11223',
      department: deptECE._id,
      designation: f9.designation,
      dateOfJoining: new Date('2023-01-05'),
      highestQualification: 'Ph.D. in Microelectronics (BITS Pilani)',
      specialization: 'MEMS Sensors & Wearable Biosensors',
      researchInterests: ['Microfluidics', 'Flexible Electronics', 'IoT Wearables', 'Energy Harvesting'],
      orcidId: '0000-0003-1122-3344',
      scopusId: '57255990011',
      biography: 'Dr. Priya Sundaram designs micro-electro-mechanical systems (MEMS) and non-invasive sensors for wearable biomedical telemetry.',
      completionPercentage: 84
    },
    {
      user: f10._id,
      facultyId: f10.facultyId,
      fullName: f10.name,
      officialEmail: f10.email,
      phoneNumber: '+91 98450 99001',
      department: deptDSAI._id,
      designation: f10.designation,
      dateOfJoining: new Date('2016-07-20'),
      highestQualification: 'Ph.D. in Computer Vision (Carnegie Mellon / IIT Bombay)',
      specialization: 'Autonomous Vehicles & Video Analytics',
      researchInterests: ['3D Point Cloud Processing', 'Visual Odometry', 'Multi-Sensor Fusion', 'Real-Time Edge Perception'],
      orcidId: '0000-0002-8899-0011',
      scopusId: '57266001122',
      biography: 'Dr. Manoj Mukhopadhyay is an author of 2 Springer textbooks on computer vision and holds 4 patents in sensor fusion algorithms for driver assistance systems.',
      completionPercentage: 96
    }
  ]);

  console.log(`[Seed] Created 10 detailed Faculty Profiles.`);

  // 5. Create Institutional Research Facilities & Labs
  await Facility.create([
    {
      name: 'NVIDIA Center of Excellence in High-Performance Computing & AI',
      facilityCode: 'FAC-HPC-01',
      department: deptDSAI._id,
      location: 'Turing Computing Tower, 4th Floor, Room 402',
      facultyInCharge: f10._id,
      labTechnician: 'Mr. Santosh Kumar (Senior HPC Administrator)',
      description: 'Dedicated GPU supercomputing facility powering deep learning model training, climate simulations, and large-scale multimodal research.',
      researchDomains: ['Supercomputing', 'Generative AI', 'Large Language Models', 'Parallel Architectures'],
      workstationCapacity: 45,
      status: 'Operational',
      equipmentList: [
        { name: 'NVIDIA DGX H100 GPU Supercomputer Server', model: 'DGX-H100 8-way', manufacturer: 'NVIDIA', quantity: 2, status: 'Operational', approxValueInr: 65000000 },
        { name: 'Dell PowerEdge High Density Cluster Storage (1 PB)', model: 'PowerEdge R750xa', manufacturer: 'Dell Technologies', quantity: 4, status: 'Operational', approxValueInr: 8500000 },
        { name: 'Mellanox 400Gbps InfiniBand Quantum Switches', model: 'QM9700', manufacturer: 'NVIDIA Mellanox', quantity: 2, status: 'Operational', approxValueInr: 2400000 }
      ],
      softwareTools: ['NVIDIA AI Enterprise', 'PyTorch Distributed Cluster', 'SLURM Workload Manager', 'CUDA Toolkit 12.4', 'Docker Enterprise Container Registry'],
      industryPartners: ['NVIDIA Corporation', 'Intel AI Academy', 'Google Cloud Research']
    },
    {
      name: 'Advanced VLSI System-on-Chip (SoC) & Semiconductor Design Center',
      facilityCode: 'FAC-VLSI-02',
      department: deptECE._id,
      location: 'Silicon Innovation Block, 2nd Floor, Room 215',
      facultyInCharge: f3._id,
      labTechnician: 'Ms. Meena Kumari (EDA Tool Specialist)',
      description: 'Full-cycle microelectronic design laboratory equipped with commercial Electronic Design Automation (EDA) suites for tape-out and ASIC physical verification.',
      researchDomains: ['ASIC Design', 'FPGA Prototyping', 'Mixed-Signal Circuits', 'Sub-7nm Physical Layout'],
      workstationCapacity: 40,
      status: 'Operational',
      equipmentList: [
        { name: 'Cadence Complete Custom IC & Digital Tapeout Suite (Server Node)', model: 'Cadence Innovus & Virtuoso', manufacturer: 'Cadence Design Systems', quantity: 30, status: 'Operational', approxValueInr: 12000000 },
        { name: 'Xilinx Zynq UltraScale+ MPSoC Development Platforms', model: 'ZCU102 Evaluation Kit', manufacturer: 'AMD Xilinx', quantity: 15, status: 'Operational', approxValueInr: 3500000 },
        { name: 'Rohde & Schwarz 4-Channel High Bandwidth Digital Oscilloscope', model: 'RTO64 4 GHz', manufacturer: 'Rohde & Schwarz', quantity: 4, status: 'Operational', approxValueInr: 4200000 }
      ],
      softwareTools: ['Cadence Virtuoso', 'Synopsys Design Compiler', 'Mentor Graphics ModelSim', 'Xilinx Vivado ML'],
      industryPartners: ['Texas Instruments', 'Qualcomm University Program', 'Synopsys Inc']
    },
    {
      name: 'Robotics, Autonomous Vehicles & Mechatronics Hub',
      facilityCode: 'FAC-ROB-03',
      department: deptMECH._id,
      location: 'Mechanical Engineering Annex, Ground Floor, Bay 01',
      facultyInCharge: f8._id,
      labTechnician: 'Mr. Anand Patil (Mechatronics Specialist)',
      description: 'Heavy industrial robotics and unmanned autonomous systems proving ground featuring 6-axis articulated arms, mobile AGVs, and laser welding workcells.',
      researchDomains: ['Industrial Automation', 'Autonomous Mobile Robots (AMRs)', 'Soft Manipulators', 'Computer Vision Guidance'],
      workstationCapacity: 35,
      status: 'Operational',
      equipmentList: [
        { name: 'KUKA 6-Axis Industrial Articulated Robot Arm', model: 'KR 10 R1100-2 cybertech', manufacturer: 'KUKA Roboter GmbH', quantity: 2, status: 'Operational', approxValueInr: 7800000 },
        { name: 'Ouster 64-Channel 3D LiDAR Sensor System', model: 'OS1-64 Gen 2', manufacturer: 'Ouster Inc', quantity: 3, status: 'Operational', approxValueInr: 1800000 },
        { name: 'Clearpath Husky Autonomous Ground Research Vehicle', model: 'Husky A200 AGV', manufacturer: 'Clearpath Robotics', quantity: 2, status: 'Operational', approxValueInr: 3200000 }
      ],
      softwareTools: ['ROS2 Humble Hawksbill', 'Gazebo Multi-Robot Simulator', 'SolidWorks 2024 Simulation Premium', 'MATLAB Robotics Toolbox'],
      industryPartners: ['KUKA Robotics', 'Tata Motors Advanced Engineering', 'Bosch Rexroth']
    },
    {
      name: 'Renewable Energy, Thermal Systems & Electric Vehicle Propulsion Lab',
      facilityCode: 'FAC-REN-04',
      department: deptMECH._id,
      location: 'Energy Research Complex, Level 1, Room 108',
      facultyInCharge: f4._id,
      labTechnician: 'Mr. Rakesh Sharma (Thermal Engineer)',
      description: 'Experimental laboratory dedicated to battery thermal management testbenches, solar photovoltaic-thermal characterization, and regenerative dynamometers.',
      researchDomains: ['EV Battery Storage', 'Phase Change Cooling', 'Solar Thermal Engineering', 'Regenerative Braking'],
      workstationCapacity: 25,
      status: 'Operational',
      equipmentList: [
        { name: 'Biologic Modular Multi-Channel Battery Cycler & Impedance Analyzer', model: 'BCS-815', manufacturer: 'BioLogic Science Instruments', quantity: 1, status: 'Operational', approxValueInr: 4500000 },
        { name: 'FLIR High-Resolution Scientific Thermal Imaging Camera', model: 'T865 640x480 IR', manufacturer: 'Teledyne FLIR', quantity: 2, status: 'Operational', approxValueInr: 2800000 }
      ],
      softwareTools: ['Ansys Fluent CFD', 'COMSOL Multiphysics Battery Design Module', 'LabVIEW Professional'],
      industryPartners: ['Mahindra Electric', 'L&T Energy', 'Thermax India']
    },
    {
      name: 'Internet of Things (IoT) & 5G/6G Wireless Testbed',
      facilityCode: 'FAC-IOT-05',
      department: deptECE._id,
      location: 'Telecommunications Tower, 3rd Floor, Room 304',
      facultyInCharge: f5._id,
      labTechnician: 'Ms. Swati Deshpande (RF Engineer)',
      description: 'End-to-end wireless prototyping testbed equipped with Software-Defined Radios (SDR), anechoic test enclosures, and low-power wide-area sensor networks.',
      researchDomains: ['5G New Radio', 'Massive MIMO Beamforming', 'LoRaWAN Edge Mesh', 'Smart Grid Sensors'],
      workstationCapacity: 30,
      status: 'Operational',
      equipmentList: [
        { name: 'NI USRP-2974 Standalone Software-Defined Radio', model: 'USRP X310 / 2974', manufacturer: 'National Instruments', quantity: 6, status: 'Operational', approxValueInr: 5400000 },
        { name: 'Keysight 26 GHz Microwave Spectrum Analyzer', model: 'FieldFox N9918B', manufacturer: 'Keysight Technologies', quantity: 2, status: 'Operational', approxValueInr: 4800000 }
      ],
      softwareTools: ['NI LabVIEW Communications', 'MATLAB 5G & LTE Toolbox', 'OpenAirInterface 5G Stack', 'Wireshark Protocol Analyzer'],
      industryPartners: ['Cisco Systems', 'Ericsson Telecom', 'Nokia Bell Labs']
    },
    {
      name: 'Distributed Cloud Virtualization & Cybersecurity Center',
      facilityCode: 'FAC-CYB-06',
      department: deptCSE._id,
      location: 'Software Engineering Complex, Level 2, Room 220',
      facultyInCharge: f7._id,
      labTechnician: 'Mr. Vivek Joshi (Certified Ethical Hacker)',
      description: 'Isolated cyber range and virtualized data center rack designed for defensive red-team exercises, smart contract auditing, and secure multi-party computing.',
      researchDomains: ['Zero Trust Architecture', 'Post-Quantum Encryption', 'Threat Hunting', 'Cloud Native Security'],
      workstationCapacity: 50,
      status: 'Operational',
      equipmentList: [
        { name: 'Cisco Threat Grid Sandbox Appliance & Firepower 4100', model: 'FPR-4115-K9', manufacturer: 'Cisco Systems', quantity: 2, status: 'Operational', approxValueInr: 6800000 },
        { name: 'Hardware Security Module (HSM) FIPS 140-2 Level 3', model: 'Luna PCIe HSM A790', manufacturer: 'Thales DIS', quantity: 2, status: 'Operational', approxValueInr: 3200000 }
      ],
      softwareTools: ['Splunk Enterprise Security', 'Kali Linux Cyber Range', 'Burp Suite Professional', 'Truffle Suite & Slither'],
      industryPartners: ['Fortinet Network Security', 'Check Point Software', 'Palo Alto Networks']
    }
  ]);

  console.log(`[Seed] Created 6 state-of-the-art Institutional Research Facilities & Labs.`);

  // 6. Create Research Publications
  await Publication.create([
    {
      faculty: f1._id,
      department: deptCSE._id,
      title: 'Federated Edge Learning with Adaptive Quantization over Heterogeneous Wireless IoT Networks',
      abstract: 'We propose a distributed stochastic quantization framework for federated model synchronization across constrained wireless IoT edge gateways, achieving 68% compression with negligible accuracy degradation.',
      publicationType: 'journal',
      academicYear: '2024-2025',
      authors: [
        { name: 'Dr. Aarav Sharma', affiliation: 'Apex Institute of Technology & Research', isCorresponding: true, contributionRole: 'Primary Author & Theoretical Framework' },
        { name: 'Dr. Rajeshwar Rao', affiliation: 'Apex Institute of Technology & Research', isCorresponding: false, contributionRole: 'Wireless Network Channel Simulation' }
      ],
      journalOrConferenceName: 'IEEE Transactions on Mobile Computing',
      publisher: 'IEEE',
      publicationDate: new Date('2024-03-15'),
      volume: '23',
      issue: '3',
      pageNumbers: '1845-1859',
      doi: '10.1109/TMC.2024.3210987',
      issnOrIsbn: '1536-1233',
      indexingStatus: { isScopus: true, isWoS: true, isUgcCare: true, isPeerReviewed: true, quartile: 'Q1' },
      citationCount: 14,
      citationSource: 'Scopus Indexed',
      verificationStatus: VERIFICATION_STATUSES.APPROVED,
      reviewerComments: 'Verified with IEEE Xplore DOI registry.'
    },
    {
      faculty: f1._id,
      department: deptCSE._id,
      title: 'Resilient Microservice Orchestration in Multi-Cluster Kubernetes under Cascading Network Partitions',
      abstract: 'Investigates self-healing service mesh control planes using consensus-driven health probes, mitigating traffic blackholing during transient wide-area cloud disconnects.',
      publicationType: 'journal',
      academicYear: '2023-2024',
      authors: [
        { name: 'Dr. Aarav Sharma', affiliation: 'Apex Institute of Technology & Research', isCorresponding: true, contributionRole: 'System Design & Benchmarking' }
      ],
      journalOrConferenceName: 'ACM Transactions on Computer Systems (TOCS)',
      publisher: 'ACM',
      publicationDate: new Date('2023-11-20'),
      volume: '41',
      issue: '4',
      pageNumbers: '220-238',
      doi: '10.1145/3547890.3547898',
      issnOrIsbn: '0734-2071',
      indexingStatus: { isScopus: true, isWoS: true, isUgcCare: true, isPeerReviewed: true, quartile: 'Q1' },
      citationCount: 22,
      citationSource: 'ACM Digital Library',
      verificationStatus: VERIFICATION_STATUSES.APPROVED,
      reviewerComments: 'Confirmed paper reprint on record.'
    },
    {
      faculty: f2._id,
      department: deptDSAI._id,
      title: 'Multilingual Cross-Attention Alignment for Low-Resource Indic Language Machine Translation',
      abstract: 'Presents a semi-supervised vocabulary alignment technique bridging English representations with Dravidian and Indo-Aryan dialects, improving BLEU scores by 4.2 points.',
      publicationType: 'journal',
      academicYear: '2024-2025',
      authors: [
        { name: 'Dr. Ananya Iyer', affiliation: 'Apex Institute of Technology & Research', isCorresponding: true, contributionRole: 'Model Architecture & Evaluation' }
      ],
      journalOrConferenceName: 'Computational Linguistics - MIT Press',
      publisher: 'MIT Press',
      publicationDate: new Date('2024-05-10'),
      volume: '50',
      issue: '2',
      pageNumbers: '312-330',
      doi: '10.1162/coli_a_00492',
      issnOrIsbn: '0891-2017',
      indexingStatus: { isScopus: true, isWoS: true, isUgcCare: true, isPeerReviewed: true, quartile: 'Q1' },
      citationCount: 9,
      citationSource: 'Web of Science',
      verificationStatus: VERIFICATION_STATUSES.APPROVED
    },
    {
      faculty: f3._id,
      department: deptECE._id,
      title: 'Energy-Efficient Approximate Multiplier Architectures for Ultra-Low-Power Edge Neural Accelerators',
      abstract: 'Proposes an 8-bit truncated carry-save array multiplier in 28nm FD-SOI CMOS consuming 41% less dynamic energy while retaining 98.4% top-1 ImageNet accuracy.',
      publicationType: 'journal',
      academicYear: '2023-2024',
      authors: [
        { name: 'Prof. Vikram Nair', affiliation: 'Apex Institute of Technology & Research', isCorresponding: true, contributionRole: 'Silicon Layout & Timing Closure' }
      ],
      journalOrConferenceName: 'IEEE Transactions on Very Large Scale Integration (VLSI) Systems',
      publisher: 'IEEE',
      publicationDate: new Date('2023-08-14'),
      volume: '31',
      issue: '8',
      pageNumbers: '1180-1194',
      doi: '10.1109/TVLSI.2023.3289012',
      issnOrIsbn: '1063-8210',
      indexingStatus: { isScopus: true, isWoS: true, isUgcCare: true, isPeerReviewed: true, quartile: 'Q1' },
      citationCount: 31,
      citationSource: 'Scopus',
      verificationStatus: VERIFICATION_STATUSES.APPROVED
    },
    {
      faculty: f4._id,
      department: deptMECH._id,
      title: 'Experimental Thermal Characterization of Nanocomposite Phase Change Materials for Li-Ion Battery Packs',
      abstract: 'Evaluates paraffin wax enriched with multi-walled carbon nanotubes to prevent thermal runaway in 21700 cylindrical cells during 3C fast charging cycles.',
      publicationType: 'journal',
      academicYear: '2024-2025',
      authors: [
        { name: 'Dr. Neha Sengupta', affiliation: 'Apex Institute of Technology & Research', isCorresponding: true, contributionRole: 'Calorimetry & Experimental Execution' }
      ],
      journalOrConferenceName: 'Applied Thermal Engineering - Elsevier',
      publisher: 'Elsevier',
      publicationDate: new Date('2024-02-18'),
      volume: '238',
      pageNumbers: '121890',
      doi: '10.1016/j.applthermaleng.2023.121890',
      issnOrIsbn: '1359-4311',
      indexingStatus: { isScopus: true, isWoS: true, isUgcCare: true, isPeerReviewed: true, quartile: 'Q1' },
      citationCount: 18,
      citationSource: 'Scopus Indexed',
      verificationStatus: VERIFICATION_STATUSES.APPROVED
    },
    {
      faculty: f10._id,
      department: deptDSAI._id,
      title: 'Deep Multi-Modal LiDAR-Camera Fusion for Real-Time 3D Object Detection in Adverse Weather',
      abstract: 'Introduces an attention-based voxel encoder fusing sparse point clouds with RGB video under dense fog and heavy rain conditions, achieving 76.8% mAP on nuScenes benchmark.',
      publicationType: 'journal',
      academicYear: '2023-2024',
      authors: [
        { name: 'Dr. Manoj Mukhopadhyay', affiliation: 'Apex Institute of Technology & Research', isCorresponding: true, contributionRole: 'Network Architecture & Training' }
      ],
      journalOrConferenceName: 'IEEE Transactions on Intelligent Transportation Systems',
      publisher: 'IEEE',
      publicationDate: new Date('2023-10-05'),
      volume: '24',
      issue: '10',
      pageNumbers: '11200-11215',
      doi: '10.1109/TITS.2023.3298411',
      issnOrIsbn: '1524-9050',
      indexingStatus: { isScopus: true, isWoS: true, isUgcCare: true, isPeerReviewed: true, quartile: 'Q1' },
      citationCount: 27,
      citationSource: 'IEEE Xplore',
      verificationStatus: VERIFICATION_STATUSES.APPROVED
    },
    {
      faculty: f8._id,
      department: deptMECH._id,
      title: 'A Method and System for Compliant Robotic Gripper with Embedded Tactile Micro-Sensor Array',
      abstract: 'Patent for an anthropomorphic adaptive robotic end-effector capable of fragile object grasping with closed-loop pressure feedback.',
      publicationType: 'patent',
      academicYear: '2023-2024',
      authors: [
        { name: 'Dr. Kavita Deshmukh', affiliation: 'Apex Institute of Technology & Research', isCorresponding: true, contributionRole: 'Lead Inventor' }
      ],
      journalOrConferenceName: 'Indian Patent Office Gazette (Official Patent Journal)',
      publisher: 'Indian Patent Office (IPO)',
      publicationDate: new Date('2023-12-01'),
      doi: '',
      issnOrIsbn: 'Patent No: IN 412890 B',
      indexingStatus: { isScopus: false, isWoS: false, isUgcCare: true, isPeerReviewed: true },
      citationCount: 4,
      verificationStatus: VERIFICATION_STATUSES.APPROVED
    }
  ]);

  console.log(`[Seed] Created 7 peer-reviewed publications with citations.`);

  // 7. Create Professional Achievements & FDPs
  await Achievement.create([
    {
      faculty: f1._id,
      department: deptCSE._id,
      title: 'AICTE-ATAL 2-Week Faculty Development Program on Cloud-Native Distributed Microservices',
      category: 'fdp',
      issuingOrganization: 'IIT Bombay & AICTE ATAL Academy',
      startDate: new Date('2023-06-05'),
      endDate: new Date('2023-06-16'),
      academicYear: '2023-2024',
      advancementPoints: 12,
      verificationStatus: VERIFICATION_STATUSES.APPROVED,
      reviewerComments: 'Verified certificate issued by AICTE portal.'
    },
    {
      faculty: f2._id,
      department: deptDSAI._id,
      title: 'NPTEL Elite Gold Certification with Top 1% in Deep Learning',
      category: 'certification',
      issuingOrganization: 'NPTEL - IIT Madras',
      startDate: new Date('2023-07-01'),
      endDate: new Date('2023-10-30'),
      academicYear: '2023-2024',
      advancementPoints: 10,
      verificationStatus: VERIFICATION_STATUSES.APPROVED
    },
    {
      faculty: f3._id,
      department: deptECE._id,
      title: 'Elected as Senior Member of the Institute of Electrical and Electronics Engineers (IEEE)',
      category: 'award_recognition',
      issuingOrganization: 'IEEE USA',
      startDate: new Date('2023-03-10'),
      endDate: new Date('2023-03-10'),
      academicYear: '2022-2023',
      advancementPoints: 15,
      verificationStatus: VERIFICATION_STATUSES.APPROVED
    },
    {
      faculty: f4._id,
      department: deptMECH._id,
      title: 'National Best Innovation in Renewable Technologies Award',
      category: 'award_recognition',
      issuingOrganization: 'Ministry of New and Renewable Energy (MNRE)',
      startDate: new Date('2024-01-26'),
      endDate: new Date('2024-01-26'),
      academicYear: '2023-2024',
      advancementPoints: 20,
      verificationStatus: VERIFICATION_STATUSES.APPROVED
    },
    {
      faculty: f10._id,
      department: deptDSAI._id,
      title: 'Invited Keynote Speaker on Autonomous Vehicle Sensor Fusion at IEEE ICRA 2024',
      category: 'invited_talk',
      issuingOrganization: 'IEEE Robotics and Automation Society',
      startDate: new Date('2024-05-15'),
      endDate: new Date('2024-05-15'),
      academicYear: '2023-2024',
      advancementPoints: 10,
      verificationStatus: VERIFICATION_STATUSES.APPROVED
    }
  ]);

  console.log(`[Seed] Created 5 verified achievements & FDP records.`);

  // 8. Create Sponsored Research Grants & Projects
  await ResearchProject.create([
    {
      faculty: f1._id,
      department: deptCSE._id,
      title: 'Edge-Native Distributed Learning Frameworks for Resilient Smart City Cyber-Physical Systems',
      fundingAgency: 'Science and Engineering Research Board (SERB - CRG)',
      role: 'Principal Investigator (PI)',
      sanctionOrderNumber: 'SERB/CRG/2022/001490',
      grantAmount: 3850000,
      startDate: new Date('2022-04-01'),
      endDate: new Date('2025-03-31'),
      academicYear: '2022-2023',
      status: 'ongoing'
    },
    {
      faculty: f3._id,
      department: deptECE._id,
      title: 'Design and Silicon Prototyping of Ultra-Low-Power RISC-V SoC for Implantable Medical Devices',
      fundingAgency: 'Department of Biotechnology (DBT) & MeitY Chip-to-Startup (C2S)',
      role: 'Principal Investigator (PI)',
      sanctionOrderNumber: 'MeitY/C2S/2023/184',
      grantAmount: 6400000,
      startDate: new Date('2023-08-01'),
      endDate: new Date('2026-07-31'),
      academicYear: '2023-2024',
      status: 'ongoing'
    },
    {
      faculty: f4._id,
      department: deptMECH._id,
      title: 'Optimization of Composite Phase Change Material Heat Sinks for Heavy Commercial Electric Trucks',
      fundingAgency: 'Tata Motors R&D Consultancy',
      role: 'Principal Investigator (PI)',
      sanctionOrderNumber: 'TATA/RD/2023/882',
      grantAmount: 1850000,
      startDate: new Date('2023-11-01'),
      endDate: new Date('2024-10-31'),
      academicYear: '2023-2024',
      status: 'ongoing'
    },
    {
      faculty: f10._id,
      department: deptDSAI._id,
      title: 'Robust Perception Models under Degraded Environmental Imagery for Autonomous Agricultural Tractors',
      fundingAgency: 'Mahindra & Mahindra AgTech Division',
      role: 'Principal Investigator (PI)',
      sanctionOrderNumber: 'MM/AG/2024/09',
      grantAmount: 2200000,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2025-01-14'),
      academicYear: '2023-2024',
      status: 'ongoing'
    }
  ]);

  console.log(`[Seed] Created 4 sponsored research & consultancy grants.`);

  // 9. Career Advancement Policy
  await AdvancementPolicy.create({
    policyName: 'UGC-AICTE Institutional CAS Promotion Framework 2026',
    version: 'v1.0',
    institutionName: 'Apex Institute of Technology & Research',
    isActive: true,
    criteriaRules: [
      { category: 'journal', label: 'Journal Article (Scopus/WoS Indexed)', pointsPerItem: 10, minRequiredCount: 2, maxPointsCap: 50 },
      { category: 'conference', label: 'Conference Paper (Indexed)', pointsPerItem: 5, minRequiredCount: 2, maxPointsCap: 20 },
      { category: 'patent', label: 'Granted / Published Patent', pointsPerItem: 15, minRequiredCount: 0, maxPointsCap: 30 },
      { category: 'fdp', label: 'Faculty Development Program (>1 Week)', pointsPerItem: 10, minRequiredCount: 1, maxPointsCap: 30 },
      { category: 'funded_project', label: 'Sponsored Research Project (>5 Lakhs)', pointsPerItem: 20, minRequiredCount: 0, maxPointsCap: 40 },
    ],
    stages: [
      {
        stageName: 'Level 10 to Level 11 (Assistant Professor Senior Scale)',
        fromDesignation: 'Assistant Professor',
        toDesignation: 'Assistant Professor (Senior Scale)',
        minYearsOfService: 4,
        minTotalPoints: 50,
        minJournalPublications: 2,
        minFdpAttended: 1,
      },
      {
        stageName: 'Level 11 to Level 12 (Associate Professor)',
        fromDesignation: 'Assistant Professor (Senior Scale)',
        toDesignation: 'Associate Professor',
        minYearsOfService: 5,
        minTotalPoints: 80,
        minJournalPublications: 4,
        minFdpAttended: 2,
      },
    ],
  });

  // 10. Sample Notifications
  await Notification.create([
    {
      recipient: f1._id,
      sender: reviewerUser._id,
      title: 'Publication Approved for CAS',
      message: 'Your publication "Federated Edge Learning with Adaptive Quantization" has been verified and approved.',
      type: 'publication_approved',
      isRead: false,
      link: '/publications',
    },
    {
      recipient: f1._id,
      sender: reviewerUser._id,
      title: 'Research Facility Allocation',
      message: 'You have been granted allocated compute time on the NVIDIA DGX H100 Supercomputing Facility.',
      type: 'system',
      isRead: false,
      link: '/facilities',
    }
  ]);

  console.log(`[Seed] Institutional demo dataset seeding completed successfully!`);
};
