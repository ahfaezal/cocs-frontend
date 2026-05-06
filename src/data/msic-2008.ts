export type MSICSection = {
  code: string;
  title: string;
};

export type MSICGroup = {
  code: string;
  sectionCode: string;
  title: string;
};

export const MSIC_SECTIONS: MSICSection[] = [
  {
    code: 'A',
    title: 'Agriculture, Forestry and Fishing',
  },
  {
    code: 'B',
    title: 'Mining and Quarrying',
  },
  {
    code: 'C',
    title: 'Manufacturing',
  },
  {
    code: 'D',
    title: 'Electricity, Gas, Steam and Air Conditioning Supply',
  },
  {
    code: 'E',
    title: 'Water Supply; Sewerage, Waste Management and Remediation Activities',
  },
  {
    code: 'F',
    title: 'Construction',
  },
  {
    code: 'G',
    title: 'Wholesale and Retail Trade; Repair of Motor Vehicles and Motorcycles',
  },
  {
    code: 'H',
    title: 'Transportation and Storage',
  },
  {
    code: 'I',
    title: 'Accommodation and Food Service Activities',
  },
  {
    code: 'J',
    title: 'Information and Communication',
  },
  {
    code: 'K',
    title: 'Financial and Insurance/Takaful Activities',
  },
  {
    code: 'L',
    title: 'Real Estate Activities',
  },
  {
    code: 'M',
    title: 'Professional, Scientific and Technical Activities',
  },
  {
    code: 'N',
    title: 'Administrative and Support Service Activities',
  },
  {
    code: 'O',
    title: 'Public Administration and Defence; Compulsory Social Security',
  },
  {
    code: 'P',
    title: 'Education',
  },
  {
    code: 'Q',
    title: 'Human Health and Social Work Activities',
  },
  {
    code: 'R',
    title: 'Arts, Entertainment and Recreation',
  },
  {
    code: 'S',
    title: 'Other Service Activities',
  },
  {
    code: 'T',
    title: 'Activities of Households as Employers; Undifferentiated Goods- and Services-Producing Activities of Households for Own Use',
  },
  {
    code: 'U',
    title: 'Activities of Extraterritorial Organizations and Bodies',
  },
];

export const MSIC_GROUPS: MSICGroup[] = [
  {
    sectionCode: 'A',
    code: '011',
    title: 'Growing of non-perennial crops',
  },
  {
    sectionCode: 'A',
    code: '012',
    title: 'Growing of perennial crops',
  },
  {
    sectionCode: 'A',
    code: '013',
    title: 'Plant propagation',
  },
  {
    sectionCode: 'A',
    code: '014',
    title: 'Animal production',
  },
  {
    sectionCode: 'A',
    code: '015',
    title: 'Mixed farming',
  },
  {
    sectionCode: 'A',
    code: '016',
    title: 'Support activities to agriculture and post-harvest crops activities',
  },
  {
    sectionCode: 'A',
    code: '017',
    title: 'Hunting, trapping and related service activities',
  },
  {
    sectionCode: 'A',
    code: '021',
    title: 'Silviculture and other forestry activities',
  },
  {
    sectionCode: 'A',
    code: '022',
    title: 'Logging',
  },
  {
    sectionCode: 'A',
    code: '023',
    title: 'Gathering of non-wood forest products',
  },
  {
    sectionCode: 'A',
    code: '024',
    title: 'Support services to forestry',
  },
  {
    sectionCode: 'A',
    code: '031',
    title: 'Fishing',
  },
  {
    sectionCode: 'A',
    code: '032',
    title: 'Aquaculture',
  },
  {
    sectionCode: 'B',
    code: '051',
    title: 'Mining of hard coal',
  },
  {
    sectionCode: 'B',
    code: '052',
    title: 'Mining of lignite',
  },
  {
    sectionCode: 'B',
    code: '061',
    title: 'Extraction of crude petroleum',
  },
  {
    sectionCode: 'B',
    code: '062',
    title: 'Extraction of natural gas',
  },
  {
    sectionCode: 'B',
    code: '071',
    title: 'Mining of iron ores',
  },
  {
    sectionCode: 'B',
    code: '072',
    title: 'Mining of non-ferrous metal ores',
  },
  {
    sectionCode: 'B',
    code: '081',
    title: 'Quarrying of stone, sand and clay',
  },
  {
    sectionCode: 'B',
    code: '089',
    title: 'Mining and quarrying n.e.c.',
  },
  {
    sectionCode: 'B',
    code: '091',
    title: 'Support activities for petroleum and natural gas extraction',
  },
  {
    sectionCode: 'B',
    code: '099',
    title: 'Support activities for other mining and quarrying',
  },
  {
    sectionCode: 'C',
    code: '101',
    title: 'Processing and preserving of meat',
  },
  {
    sectionCode: 'C',
    code: '102',
    title: 'Processing and preserving of fish, crustaceans and molluscs',
  },
  {
    sectionCode: 'C',
    code: '103',
    title: 'Processing and preserving of fruit and vegetables',
  },
  {
    sectionCode: 'C',
    code: '104',
    title: 'Manufacture of vegetable and animal oils and fats',
  },
  {
    sectionCode: 'C',
    code: '105',
    title: 'Manufacture of dairy products',
  },
  {
    sectionCode: 'C',
    code: '106',
    title: 'Manufacture of grain mill products, starches and starch products',
  },
  {
    sectionCode: 'C',
    code: '107',
    title: 'Manufacture of other food products',
  },
  {
    sectionCode: 'C',
    code: '108',
    title: 'Manufacture of prepared animal feeds',
  },
  {
    sectionCode: 'C',
    code: '110',
    title: 'Manufacture of beverages',
  },
  {
    sectionCode: 'C',
    code: '120',
    title: 'Manufacture of tobacco products',
  },
  {
    sectionCode: 'C',
    code: '131',
    title: 'Spinning, weaving and finishing of textiles',
  },
  {
    sectionCode: 'C',
    code: '139',
    title: 'Manufacture of other textiles',
  },
  {
    sectionCode: 'C',
    code: '141',
    title: 'Manufacture of wearing apparel, except fur apparel',
  },
  {
    sectionCode: 'C',
    code: '142',
    title: 'Manufacture of articles of fur',
  },
  {
    sectionCode: 'C',
    code: '143',
    title: 'Manufacture of knitted and crocheted apparel',
  },
  {
    sectionCode: 'C',
    code: '151',
    title: 'Tanning and dressing of leather; manufacture of luggage, handbags, saddlery and harness; dressing and dyeing of fur',
  },
  {
    sectionCode: 'C',
    code: '152',
    title: 'Manufacture of footwear',
  },
  {
    sectionCode: 'C',
    code: '161',
    title: 'Sawmilling and planing of wood',
  },
  {
    sectionCode: 'C',
    code: '162',
    title: 'Manufacture of products of wood, cork, straw and plaiting materials',
  },
  {
    sectionCode: 'C',
    code: '170',
    title: 'Manufacture of paper and paper products',
  },
  {
    sectionCode: 'C',
    code: '181',
    title: 'Printing and service activities related to printing',
  },
  {
    sectionCode: 'C',
    code: '182',
    title: 'Reproduction of recorded media',
  },
  {
    sectionCode: 'C',
    code: '191',
    title: 'Manufacture of coke oven products',
  },
  {
    sectionCode: 'C',
    code: '192',
    title: 'Manufacture of refined petroleum products',
  },
  {
    sectionCode: 'C',
    code: '201',
    title: 'Manufacture of basic chemicals, fertilizers and nitrogen compounds, plastics and synthetic rubber in primary forms',
  },
  {
    sectionCode: 'C',
    code: '202',
    title: 'Manufacture of other chemical products',
  },
  {
    sectionCode: 'C',
    code: '203',
    title: 'Manufacture of man-made fibres',
  },
  {
    sectionCode: 'C',
    code: '210',
    title: 'Manufacture of pharmaceuticals, medicinal chemical and botanical products',
  },
  {
    sectionCode: 'C',
    code: '221',
    title: 'Manufacture of rubber products',
  },
  {
    sectionCode: 'C',
    code: '222',
    title: 'Manufacture of plastics products',
  },
  {
    sectionCode: 'C',
    code: '231',
    title: 'Manufacture of glass and glass products',
  },
  {
    sectionCode: 'C',
    code: '239',
    title: 'Manufacture of non-metallic mineral products n.e.c.',
  },
  {
    sectionCode: 'C',
    code: '241',
    title: 'Manufacture of basic iron and steel',
  },
  {
    sectionCode: 'C',
    code: '242',
    title: 'Manufacture of basic precious and other non-ferrous metals',
  },
  {
    sectionCode: 'C',
    code: '243',
    title: 'Casting of metals',
  },
  {
    sectionCode: 'C',
    code: '251',
    title: 'Manufacture of structural metal products, tanks, reservoirs and steam generators',
  },
  {
    sectionCode: 'C',
    code: '252',
    title: 'Manufacture of weapons and ammunition',
  },
  {
    sectionCode: 'C',
    code: '259',
    title: 'Manufacture of other fabricated metal products; metalworking service activities',
  },
  {
    sectionCode: 'C',
    code: '261',
    title: 'Manufacture of electronic components and boards',
  },
  {
    sectionCode: 'C',
    code: '262',
    title: 'Manufacture of computers and peripheral equipment',
  },
  {
    sectionCode: 'C',
    code: '263',
    title: 'Manufacture of communication equipment',
  },
  {
    sectionCode: 'C',
    code: '264',
    title: 'Manufacture of consumer electronics',
  },
  {
    sectionCode: 'C',
    code: '265',
    title: 'Manufacture of measuring, testing, navigating and control equipment; watches and clocks',
  },
  {
    sectionCode: 'C',
    code: '266',
    title: 'Manufacture of irradiation, electromedical and electrotherapeutic equipment',
  },
  {
    sectionCode: 'C',
    code: '267',
    title: 'Manufacture of optical instruments and photographic equipment',
  },
  {
    sectionCode: 'C',
    code: '268',
    title: 'Manufacture of magnetic and optical media',
  },
  {
    sectionCode: 'C',
    code: '271',
    title: 'Manufacture of electric motors, generators, transformers and electricity distribution and control apparatus',
  },
  {
    sectionCode: 'C',
    code: '272',
    title: 'Manufacture of batteries and accumulators',
  },
  {
    sectionCode: 'C',
    code: '273',
    title: 'Manufacture of wiring and wiring devices',
  },
  {
    sectionCode: 'C',
    code: '274',
    title: 'Manufacture of electric lighting equipment',
  },
  {
    sectionCode: 'C',
    code: '275',
    title: 'Manufacture of domestic appliances',
  },
  {
    sectionCode: 'C',
    code: '279',
    title: 'Manufacture of other electrical equipment',
  },
  {
    sectionCode: 'C',
    code: '281',
    title: 'Manufacture of general-purpose machinery',
  },
  {
    sectionCode: 'C',
    code: '282',
    title: 'Manufacture of special-purpose machinery',
  },
  {
    sectionCode: 'C',
    code: '291',
    title: 'Manufacture of motor vehicles',
  },
  {
    sectionCode: 'C',
    code: '292',
    title: 'Manufacture of bodies (coachwork) for motor vehicles; manufacture of trailers and semi-trailers',
  },
  {
    sectionCode: 'C',
    code: '293',
    title: 'Manufacture of parts and accessories for motor vehicles',
  },
  {
    sectionCode: 'C',
    code: '301',
    title: 'Building of ships and boats',
  },
  {
    sectionCode: 'C',
    code: '302',
    title: 'Manufacture of railway locomotives and rolling stock',
  },
  {
    sectionCode: 'C',
    code: '303',
    title: 'Manufacture of air and spacecraft and related machinery',
  },
  {
    sectionCode: 'C',
    code: '304',
    title: 'Manufacture of military fighting vehicles',
  },
  {
    sectionCode: 'C',
    code: '309',
    title: 'Manufacture of transport equipment n.e.c.',
  },
  {
    sectionCode: 'C',
    code: '310',
    title: 'Manufacture of furniture',
  },
  {
    sectionCode: 'C',
    code: '321',
    title: 'Manufacture of jewellery, bijouterie and related articles',
  },
  {
    sectionCode: 'C',
    code: '322',
    title: 'Manufacture of musical instruments',
  },
  {
    sectionCode: 'C',
    code: '323',
    title: 'Manufacture of sports goods',
  },
  {
    sectionCode: 'C',
    code: '324',
    title: 'Manufacture of games and toys',
  },
  {
    sectionCode: 'C',
    code: '325',
    title: 'Manufacture of medical and dental instruments and supplies',
  },
  {
    sectionCode: 'C',
    code: '329',
    title: 'Other manufacturing n.e.c.',
  },
  {
    sectionCode: 'C',
    code: '331',
    title: 'Repair of fabricated metal products, machinery and equipment',
  },
  {
    sectionCode: 'C',
    code: '332',
    title: 'Installation of industrial machinery and equipment',
  },
  {
    sectionCode: 'D',
    code: '351',
    title: 'Electric power generation, transmission and distribution',
  },
  {
    sectionCode: 'D',
    code: '352',
    title: 'Manufacture of gas; distribution of gaseous fuels through mains',
  },
  {
    sectionCode: 'D',
    code: '353',
    title: 'Steam and air conditioning supply',
  },
  {
    sectionCode: 'E',
    code: '360',
    title: 'Water collection, treatment and supply',
  },
  {
    sectionCode: 'E',
    code: '370',
    title: 'Sewerage',
  },
  {
    sectionCode: 'E',
    code: '381',
    title: 'Waste collection',
  },
  {
    sectionCode: 'E',
    code: '382',
    title: 'Waste treatment and disposal',
  },
  {
    sectionCode: 'E',
    code: '383',
    title: 'Materials recovery',
  },
  {
    sectionCode: 'E',
    code: '390',
    title: 'Remediation activities and other waste management services',
  },
  {
    sectionCode: 'F',
    code: '410',
    title: 'Construction of buildings',
  },
  {
    sectionCode: 'F',
    code: '421',
    title: 'Construction of roads and railways',
  },
  {
    sectionCode: 'F',
    code: '422',
    title: 'Construction of utility projects',
  },
  {
    sectionCode: 'F',
    code: '429',
    title: 'Construction of other civil engineering projects',
  },
  {
    sectionCode: 'F',
    code: '431',
    title: 'Demolition and site preparation',
  },
  {
    sectionCode: 'F',
    code: '432',
    title: 'Electrical, plumbing and other construction installation activities',
  },
  {
    sectionCode: 'F',
    code: '433',
    title: 'Building completion and finishing',
  },
  {
    sectionCode: 'F',
    code: '439',
    title: 'Other specialized construction activities',
  },
  {
    sectionCode: 'G',
    code: '451',
    title: 'Sale of motor vehicles',
  },
  {
    sectionCode: 'G',
    code: '452',
    title: 'Maintenance and repair of motor vehicles',
  },
  {
    sectionCode: 'G',
    code: '453',
    title: 'Sale of motor vehicle parts and accessories',
  },
  {
    sectionCode: 'G',
    code: '454',
    title: 'Sale, mainten ance and repair of motorcycles and related parts and accessories',
  },
  {
    sectionCode: 'G',
    code: '461',
    title: 'Wholesale on a fee or contract basis',
  },
  {
    sectionCode: 'G',
    code: '462',
    title: 'Wholesale of agricultural raw materials and live animals',
  },
  {
    sectionCode: 'G',
    code: '463',
    title: 'Wholesale of food, beverages and tobacco',
  },
  {
    sectionCode: 'G',
    code: '464',
    title: 'Wholesale of household goods',
  },
  {
    sectionCode: 'G',
    code: '465',
    title: 'Wholesale of machinery, equipment and supplies',
  },
  {
    sectionCode: 'G',
    code: '466',
    title: 'Other specialized wholesale',
  },
  {
    sectionCode: 'G',
    code: '469',
    title: 'Non-specialized wholesale trade',
  },
  {
    sectionCode: 'G',
    code: '471',
    title: 'Retail sale in non-specialized stores',
  },
  {
    sectionCode: 'G',
    code: '472',
    title: 'Retail sale of food, beverages and tobacco in specialized stores',
  },
  {
    sectionCode: 'G',
    code: '473',
    title: 'Retail sale of automotive fuel in specialized stores',
  },
  {
    sectionCode: 'G',
    code: '474',
    title: 'Retail sale of information and communications equipment in specialized stores',
  },
  {
    sectionCode: 'G',
    code: '475',
    title: 'Retail sale of other household equipment in specialized stores',
  },
  {
    sectionCode: 'G',
    code: '476',
    title: 'Retail sale of cultural and recreation goods in specialized stores',
  },
  {
    sectionCode: 'G',
    code: '477',
    title: 'Retail sale of other goods in specialized stores',
  },
  {
    sectionCode: 'G',
    code: '478',
    title: 'Retail sale via stalls and markets',
  },
  {
    sectionCode: 'G',
    code: '479',
    title: 'Retail trade not in stores, stalls or markets',
  },
  {
    sectionCode: 'H',
    code: '491',
    title: 'Transport via railways',
  },
  {
    sectionCode: 'H',
    code: '492',
    title: 'Other land transport',
  },
  {
    sectionCode: 'H',
    code: '493',
    title: 'Transport via pipeline',
  },
  {
    sectionCode: 'H',
    code: '501',
    title: 'Sea and coastal water transport',
  },
  {
    sectionCode: 'H',
    code: '502',
    title: 'Inland water transport',
  },
  {
    sectionCode: 'H',
    code: '511',
    title: 'Passenger air transport',
  },
  {
    sectionCode: 'H',
    code: '512',
    title: 'Freight air transport',
  },
  {
    sectionCode: 'H',
    code: '521',
    title: 'Warehousing and storage',
  },
  {
    sectionCode: 'H',
    code: '522',
    title: 'Support activities for transportation',
  },
  {
    sectionCode: 'H',
    code: '531',
    title: 'Postal activities',
  },
  {
    sectionCode: 'H',
    code: '532',
    title: 'Courier activities',
  },
  {
    sectionCode: 'I',
    code: '551',
    title: 'Short term accommodation activities',
  },
  {
    sectionCode: 'I',
    code: '552',
    title: 'Camping grounds, recreational vehicle parks and trailer parks',
  },
  {
    sectionCode: 'I',
    code: '559',
    title: 'Other accommodation',
  },
  {
    sectionCode: 'I',
    code: '561',
    title: 'Restaurants and mobile food service activities',
  },
  {
    sectionCode: 'I',
    code: '562',
    title: 'Event catering and other food service activities',
  },
  {
    sectionCode: 'I',
    code: '563',
    title: 'Beverage serving activities',
  },
  {
    sectionCode: 'J',
    code: '581',
    title: 'Publishing of books, periodicals and other publishing activities',
  },
  {
    sectionCode: 'J',
    code: '582',
    title: 'Software publishing',
  },
  {
    sectionCode: 'J',
    code: '591',
    title: 'Motion picture, video and television programme activities',
  },
  {
    sectionCode: 'J',
    code: '592',
    title: 'Sound recording and music publishing activities',
  },
  {
    sectionCode: 'J',
    code: '601',
    title: 'Radio broadcasting',
  },
  {
    sectionCode: 'J',
    code: '602',
    title: 'Television programming and broadcasting activities',
  },
  {
    sectionCode: 'J',
    code: '611',
    title: 'Wired telecommunications activities',
  },
  {
    sectionCode: 'J',
    code: '612',
    title: 'Wireless telecommunications activities',
  },
  {
    sectionCode: 'J',
    code: '613',
    title: 'Satellite telecommunications activities',
  },
  {
    sectionCode: 'J',
    code: '619',
    title: 'Other telecommunications activities',
  },
  {
    sectionCode: 'J',
    code: '620',
    title: 'Computer programming, consultancy and related activities',
  },
  {
    sectionCode: 'J',
    code: '631',
    title: 'Data processing, hosting and related activities; web portals',
  },
  {
    sectionCode: 'J',
    code: '639',
    title: 'Other information service activities',
  },
  {
    sectionCode: 'K',
    code: '641',
    title: 'Monetary intermediation',
  },
  {
    sectionCode: 'K',
    code: '642',
    title: 'Activities of holding companies',
  },
  {
    sectionCode: 'K',
    code: '643',
    title: 'Trusts, funds and similar financial entities',
  },
  {
    sectionCode: 'K',
    code: '649',
    title: 'Other financial service activities, except insurance/takaful and pension funding activities',
  },
  {
    sectionCode: 'K',
    code: '651',
    title: 'Insurance/takaful',
  },
  {
    sectionCode: 'K',
    code: '652',
    title: 'Reinsurance/retakaful',
  },
  {
    sectionCode: 'K',
    code: '653',
    title: 'Pension funding',
  },
  {
    sectionCode: 'K',
    code: '661',
    title: 'Activities auxiliary to financial service activities, except insurance/takaful and pension funding',
  },
  {
    sectionCode: 'K',
    code: '662',
    title: 'Activities auxiliary to insurance/takaful and pension funding',
  },
  {
    sectionCode: 'K',
    code: '663',
    title: 'Fund management activities',
  },
  {
    sectionCode: 'L',
    code: '681',
    title: 'Real estate activities with own or leased property',
  },
  {
    sectionCode: 'L',
    code: '682',
    title: 'Real estate activities on a fee or contract basis',
  },
  {
    sectionCode: 'M',
    code: '691',
    title: 'Legal activities',
  },
  {
    sectionCode: 'M',
    code: '692',
    title: 'Accounting, bookkeeping and auditing activities; tax consultancy',
  },
  {
    sectionCode: 'M',
    code: '701',
    title: 'Activities of head offices',
  },
  {
    sectionCode: 'M',
    code: '702',
    title: 'Management consultancy activities',
  },
  {
    sectionCode: 'M',
    code: '711',
    title: 'Architectural and engineering activities and related technical consultancy',
  },
  {
    sectionCode: 'M',
    code: '712',
    title: 'Technical testing and analysis',
  },
  {
    sectionCode: 'M',
    code: '721',
    title: 'Research and experimental development on natural sciences and engineering',
  },
  {
    sectionCode: 'M',
    code: '722',
    title: 'Research and experimental development on social sciences and humanities',
  },
  {
    sectionCode: 'M',
    code: '731',
    title: 'Advertising',
  },
  {
    sectionCode: 'M',
    code: '732',
    title: 'Market research and public opinion polling',
  },
  {
    sectionCode: 'M',
    code: '741',
    title: 'Specialized design activities',
  },
  {
    sectionCode: 'M',
    code: '742',
    title: 'Photographic activities',
  },
  {
    sectionCode: 'M',
    code: '749',
    title: 'Other professional, scientific and technical activities n.e.c.',
  },
  {
    sectionCode: 'M',
    code: '750',
    title: 'Veterinary activities',
  },
  {
    sectionCode: 'N',
    code: '771',
    title: 'Renting and leasing of motor vehicles',
  },
  {
    sectionCode: 'N',
    code: '772',
    title: 'Renting and leasing of personal and household goods',
  },
  {
    sectionCode: 'N',
    code: '773',
    title: 'Renting and leasing of other machinery, equipment and tangible goods',
  },
  {
    sectionCode: 'N',
    code: '774',
    title: 'Leasing of intellectual property and similar products, except copyrighted works',
  },
  {
    sectionCode: 'N',
    code: '781',
    title: 'Activities of employment placement agencies',
  },
  {
    sectionCode: 'N',
    code: '782',
    title: 'Temporary employment agency activities',
  },
  {
    sectionCode: 'N',
    code: '783',
    title: 'Other human resources provision',
  },
  {
    sectionCode: 'N',
    code: '791',
    title: 'Travel agency and tour operator activities',
  },
  {
    sectionCode: 'N',
    code: '799',
    title: 'Other reservation service and related activities',
  },
  {
    sectionCode: 'N',
    code: '801',
    title: 'Private security activities',
  },
  {
    sectionCode: 'N',
    code: '802',
    title: 'Security systems service activities',
  },
  {
    sectionCode: 'N',
    code: '803',
    title: 'Investigation activities',
  },
  {
    sectionCode: 'N',
    code: '811',
    title: 'Combined facilities support activities',
  },
  {
    sectionCode: 'N',
    code: '812',
    title: 'Cleaning activities',
  },
  {
    sectionCode: 'N',
    code: '813',
    title: 'Landscape care and maintenance service activities',
  },
  {
    sectionCode: 'N',
    code: '821',
    title: 'Office administrative and support activities',
  },
  {
    sectionCode: 'N',
    code: '822',
    title: 'Activities of call centres',
  },
  {
    sectionCode: 'N',
    code: '823',
    title: 'Organization of conventions and trade shows',
  },
  {
    sectionCode: 'N',
    code: '829',
    title: 'Business support service activities n.e.c.',
  },
  {
    sectionCode: 'O',
    code: '841',
    title: 'Administration of the State and the economic and social policy of the community',
  },
  {
    sectionCode: 'O',
    code: '842',
    title: 'Provision of services to the community as a whole',
  },
  {
    sectionCode: 'O',
    code: '843',
    title: 'Compulsory social security activities',
  },
  {
    sectionCode: 'P',
    code: '851',
    title: 'Pre-primary and primary education',
  },
  {
    sectionCode: 'P',
    code: '852',
    title: 'Secondary education',
  },
  {
    sectionCode: 'P',
    code: '853',
    title: 'Higher education',
  },
  {
    sectionCode: 'P',
    code: '854',
    title: 'Other education',
  },
  {
    sectionCode: 'P',
    code: '855',
    title: 'Educational support activities',
  },
  {
    sectionCode: 'Q',
    code: '861',
    title: 'Hospital activities',
  },
  {
    sectionCode: 'Q',
    code: '862',
    title: 'Medical and dental practice activities',
  },
  {
    sectionCode: 'Q',
    code: '869',
    title: 'Other human health activities',
  },
  {
    sectionCode: 'Q',
    code: '871',
    title: 'Residential nursing care facilities',
  },
  {
    sectionCode: 'Q',
    code: '872',
    title: 'Residential care activities for mental retardation, mental health and substance abuse',
  },
  {
    sectionCode: 'Q',
    code: '873',
    title: 'Residential care activities for the elderly and disabled',
  },
  {
    sectionCode: 'Q',
    code: '879',
    title: 'Other residential care activities',
  },
  {
    sectionCode: 'Q',
    code: '881',
    title: 'Social work activities without accommodation for the elderly and disabled',
  },
  {
    sectionCode: 'Q',
    code: '889',
    title: 'Other social work activities without accommodation n.e.c.',
  },
  {
    sectionCode: 'R',
    code: '900',
    title: 'Creative, arts and entertainment activities',
  },
  {
    sectionCode: 'R',
    code: '910',
    title: 'Libraries, archives, museums and other cultural activities',
  },
  {
    sectionCode: 'R',
    code: '920',
    title: 'Gambling and betting activities',
  },
  {
    sectionCode: 'R',
    code: '931',
    title: 'Sports activities',
  },
  {
    sectionCode: 'R',
    code: '932',
    title: 'Other amusement and recreation activities',
  },
  {
    sectionCode: 'S',
    code: '941',
    title: 'Activities of business, employers and professional membership organizations',
  },
  {
    sectionCode: 'S',
    code: '942',
    title: 'Activities of trade unions',
  },
  {
    sectionCode: 'S',
    code: '949',
    title: 'Activities of other membership organizations',
  },
  {
    sectionCode: 'S',
    code: '951',
    title: 'Repair of computers and communication equipment',
  },
  {
    sectionCode: 'S',
    code: '952',
    title: 'Repair of personal and household goods',
  },
  {
    sectionCode: 'S',
    code: '960',
    title: 'Other personal service activities',
  },
  {
    sectionCode: 'T',
    code: '970',
    title: 'Activities of households as employers of domestic personnel',
  },
  {
    sectionCode: 'T',
    code: '981',
    title: 'Undifferentiated goods-producing activities of private households for own use',
  },
  {
    sectionCode: 'T',
    code: '982',
    title: 'Undifferentiated service-producing activities of private households for own use',
  },
  {
    sectionCode: 'U',
    code: '990',
    title: 'Activities of extraterritorial organizations and bodies',
  },
];

export function getMSICGroupsBySection(sectionCode: string) {
  return MSIC_GROUPS.filter((group) => group.sectionCode === sectionCode);
}

export function getMSICSectionLabel(sectionCode: string) {
  const section = MSIC_SECTIONS.find((item) => item.code === sectionCode);
  return section ? `${section.code} - ${section.title}` : sectionCode;
}

export function getMSICGroupLabel(groupCode: string) {
  const group = MSIC_GROUPS.find((item) => item.code === groupCode);
  return group ? `${group.code} - ${group.title}` : groupCode;
}
