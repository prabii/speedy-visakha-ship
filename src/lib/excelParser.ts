export interface HSNItem {
  hsnCode: string;
  description: string;
}

let hsnData: HSNItem[] = [];

export const loadHSNData = async (): Promise<HSNItem[]> => {
  if (hsnData.length > 0) {
    return hsnData;
  }

  // Use only the provided HSN codes (no Excel file loading)
  hsnData = getDefaultHSNData();
  return hsnData;
};

// Default HSN data - comprehensive list
const getDefaultHSNData = (): HSNItem[] => {
  return [
    { hsnCode: '20019000', description: 'HOME MADE PICKELS' },
    { hsnCode: '2106909972', description: 'HOME MADE SNACKS (MADE FROM RICE FLOUR, GRAM FLOUR, VARIOUS INDIAN SPICES WITH EDIBLE OIL).' },
    { hsnCode: '2106909972', description: 'HOME MADE SWEETS(MADE FROM GRAM FLOUR, ALL PURPOSE FLOUR, SUGAR, USED SPICES FOR FLAVOUR AND SUGAR)' },
    { hsnCode: '9103030', description: 'HOME MADE SPICE POWDERS' },
    { hsnCode: '910999100', description: 'INDIAN SPICES' },
    { hsnCode: '1905310000', description: 'BISCUITS' },
    { hsnCode: '', description: 'DRY FRUIT' },
    { hsnCode: '19019010', description: 'Boost( MALT EXTRACT Energy & Nutrition Drink powder)' },
    { hsnCode: '19019010', description: 'Horlicks( MALT EXTRACT Energy & Nutrition Drink powder)' },
    { hsnCode: '20079910', description: 'MANGO JELLY' },
    { hsnCode: '17011390', description: 'HOME MADE SWEET POWDER (MIXED JAGGERY AND SUGAR POWDER)' },
    { hsnCode: '2106909972', description: 'HOME MADE SWEETS' },
    { hsnCode: '1806310040', description: 'CHOCOLATE' },
    { hsnCode: '4059020200', description: 'HOME MADE GHEE' },
    { hsnCode: '9603908050', description: 'CLEANING BRUSHES FOR HOUSEHOLD USE' },
    { hsnCode: '9603210000', description: 'Tooth Brush' },
    { hsnCode: '3306100000', description: 'Tooth Paste' },
    { hsnCode: '6303910010', description: 'CURTAIN' },
    { hsnCode: '71171100', description: 'FANCY JEWELLERY' },
    { hsnCode: '71171100', description: 'FANCY EAR RINGS' },
    { hsnCode: '71179010', description: 'FANCY CHAIN' },
    { hsnCode: '71171100', description: 'ARTIFICIAL EAR RINGS' },
    { hsnCode: '71179090', description: 'ARTIFICIAL DABU(vaddanam)' },
    { hsnCode: '71179090', description: 'ARTIFICAL BANGELS' },
    { hsnCode: '71171910', description: 'PLASTIC BANGLES' },
    { hsnCode: '71171910', description: 'THREAD BANGLES' },
    { hsnCode: '70181010', description: 'Glass Bangles, Metal Bangles' },
    { hsnCode: '62092000', description: 'KID DRESS SET (MADE OF 100% COTTON)' },
    { hsnCode: '95030030', description: 'KIDS PLAYING TOY' },
    { hsnCode: '62092000', description: 'KIDS WEAR DOTHI SET (MADE OF 100% COTTON)' },
    { hsnCode: '62092000', description: 'KIDS WEAR FROCK (MADE OF 100% COTTON)' },
    { hsnCode: '62092000', description: 'KIDS WEAR SOCKS PAIR' },
    { hsnCode: '62092000', description: 'KIDS WEAR SHIRT (MADE OF 100% COTTON)' },
    { hsnCode: '65010010', description: 'KIDS WEAR HED CAP' },
    { hsnCode: '64035113', description: 'KIDS WEAR SHOES PAIR' },
    { hsnCode: '33049120', description: 'BABY POWDER' },
    { hsnCode: '34011990', description: 'BABY SOAP' },
    { hsnCode: '62092000', description: 'BABY WEAR CLOTHS  MADE OF 100% COTTON' },
    { hsnCode: '62044220', description: 'LADIES WEAR DRESS SET (MADE OF 100% COTTON - KNITTED)' },
    { hsnCode: '62044390', description: 'LADIES WEAR KURTHA TOP' },
    { hsnCode: '61061000', description: 'LADIES WEAR BLOUSE (MADE OF 100% COTTON-Knitted)' },
    { hsnCode: '42022110', description: 'LADIES WEAR HAND BAG' },
    { hsnCode: '62046200', description: 'LADIES WEAR FROCK (MADE OF 100% COTTON-Knitted)' },
    { hsnCode: '62082100', description: 'LADIES WEAR INNER (MADE OF 100% COTTON-KNITTED)' },
    { hsnCode: '52084121', description: 'LADIES WEAR SAREE  MADE OF 100% COTTON-KNITTED' },
    { hsnCode: '62044390', description: 'LADIES WEAR SAREE WITH BLOUSE  MADE OF 100% COTTON-KNITTED' },
    { hsnCode: '62044390', description: 'LADIES WEAR PETTICOAT (MADE OF 100% COTTON-KNITTED)' },
    { hsnCode: '62092000', description: 'KIDS WEAR SHIRT (MADE OF 100% COTTON)' },
    { hsnCode: '62092000', description: 'KIDS WEAR TSHIRT(MADE OF 100% COTTON)' },
    { hsnCode: '62046200', description: 'LADIES WEAR SHIRT  MADE OF 100% COTTON-KNITTED' },
    { hsnCode: '61091000', description: 'LADIES WEAR TSHIRT  MADE OF 100% COTTON-KNITTED' },
    { hsnCode: '64039910', description: 'SANDALS' },
    { hsnCode: '62064000', description: 'BLOUSE PIECES' },
    { hsnCode: '62044390', description: 'LADIES WEAR LEHANGA (MADE OF 100% COTTON-Knitted)' },
    { hsnCode: '62034200', description: 'MENS WEAR BLAZER  MADE OF 100% COTTON' },
    { hsnCode: '62072190', description: 'MENS WEAR DOTHI MADE OF 100% COTTON' },
    { hsnCode: '62052000', description: 'MENS WEAR DRESS SET MADE OF 100% COTTON' },
    { hsnCode: '42033000', description: 'MENS WEAR HIP BELT' },
    { hsnCode: '61079110', description: 'MENS WEAR INNER  MADE OF 100% COTTON' },
    { hsnCode: '62034200', description: 'MENS WEAR JACKET MADE OF 100% COTTON' },
    { hsnCode: '62032200', description: 'MENS WEAR KURTHA BOTTOM MADE OF 100% COTTON' },
    { hsnCode: '62034200', description: 'MENS WEAR PANT MADE OF 100% COTTON' },
    { hsnCode: '61079110', description: 'MENS WEAR INNER  MADE OF 100% COTTON' },
    { hsnCode: '62052000', description: 'MENS WEAR DRESS SET MADE OF 100% COTTON' },
    { hsnCode: '6214900010', description: 'Men\'s Shawl (cotton)' },
    { hsnCode: '64035111', description: 'SHOES PAIR' },
    { hsnCode: '8011100', description: 'ALMONDS' },
    { hsnCode: '71179090', description: 'ARTIFICAL NECKLACE' },
    { hsnCode: '85049090', description: 'ADAPTOR   MOBILE CHARGING' },
    { hsnCode: '63071090', description: 'CLOTH PIECE' },
    { hsnCode: '6402998005', description: 'MEN\'S WEAR FOOT WEAR' },
    { hsnCode: '73239310', description: 'STEEL COOKER SET' },
    { hsnCode: '73239420', description: 'STEEL LID' },
    { hsnCode: '39249090', description: 'STEEL SNACKS MAKER' },
    { hsnCode: '73239390', description: 'STEEL TUMBLER' },
    { hsnCode: '7323930060', description: 'STAINLESS STEEL BOWL KITCHEN UTENSILS (HOUSE HOLD UTENSILS)' },
    { hsnCode: '3923109000', description: 'STAINLESS STEEL BOX - KITCHEN UTENSILS (HOUSEHOLD USE)' },
    { hsnCode: '7323930010', description: 'STAINLESS STEEL CONTAINER KITCHEN UTENSILS (HOUSEHOLD USE)' },
    { hsnCode: '7323930010', description: 'STAINLESS STEEL COOKER SET KITCHEN UTENSILS (HOUSEHOLD USE)' },
    { hsnCode: '7323930010', description: 'STAINLESS STEEL DRINKING GLASS' },
    { hsnCode: '8215993500', description: 'STAINLESS STEEL CUPS  KITCHEN UTENSILS (HOUSEHOLD USE)' },
    { hsnCode: '7323930060', description: 'STAINLESS STEEL PLATE - KITCHEN UTENSILS (HOUSEHOLD USE)' },
    { hsnCode: '8509400040', description: 'MIXER JAR' },
    { hsnCode: '8509400040', description: 'Mixer Grinders' },
    { hsnCode: '3923100000', description: 'PLASTIC BOWL' },
    { hsnCode: '3923100000', description: 'PLASTIC BOX' },
    { hsnCode: '9615110000', description: 'PLASTIC COMB' },
    { hsnCode: '3924102000', description: 'PLASTIC CUP' },
    { hsnCode: '6702100000', description: 'PLASTIC FLOWER' },
    { hsnCode: '6702100000', description: 'PLASTIC GARLAND(FANCY DECORATIVE  HANGINGS)' },
    { hsnCode: '3920590000', description: 'PLASTIC GLASS' },
    { hsnCode: '3926400000', description: 'Idols made with Plastic' },
    { hsnCode: '33049910', description: 'FACE CREAM' },
    { hsnCode: '96040000', description: 'RAKHI (Wrist Band ( RAKHI- Indian Traditional  wrist for brother and sister )' },
    { hsnCode: '6913905000', description: 'Idols Made with Ceramic' },
    { hsnCode: '7013999000', description: 'Idols Made with Glass' },
    { hsnCode: '8306290000', description: 'idols Made with Metals' },
    { hsnCode: '6802990000', description: 'idols made with Stone' },
    { hsnCode: '6702102000', description: 'ARTIFICIAL FLOWERS' },
    { hsnCode: '4420100000', description: 'idols made with Wood' },
    { hsnCode: '8306210000', description: 'DECORATIVE ITEMS' },
    { hsnCode: '74181021', description: 'BRASS GLASS' },
    { hsnCode: '74181021', description: 'BRASS BOWL' },
    { hsnCode: '74181021', description: 'BRASS PLATE' },
    { hsnCode: '74199930', description: 'BRASS SMALL IDOL' },
    { hsnCode: '74181021', description: 'BRASS SPOON' },
    { hsnCode: '74181021', description: 'BRASS POOJA BEL' },
    { hsnCode: '74181022', description: 'COPPER BOWL' },
    { hsnCode: '74181022', description: 'COPPER PLATE' },
    { hsnCode: '74181022', description: 'COPPER SPOON' },
    { hsnCode: '3304990000', description: 'FASHION FOREHEAD STICKERS' },
    { hsnCode: '9615196000', description: 'HAIR BAND' },
    { hsnCode: '9615110000', description: 'HAIR CLIPS' },
    { hsnCode: '8516310000', description: 'HAIR DRYER' },
    { hsnCode: '3305901000', description: 'HAIR OIL' },
    { hsnCode: '9615196000', description: 'HAIR RIBBON' },
    { hsnCode: '3305909030', description: 'HAIR GEL' },
    { hsnCode: '3304910010', description: 'FACE TALCKUM POWDER' },
    { hsnCode: '3401305000', description: 'FACE WASH' },
    { hsnCode: '9403608040', description: 'POOJA TABLE' },
    { hsnCode: '8205513030', description: 'VEGETABLE CUTTER' },
    { hsnCode: '9810001500', description: 'POOJA MANDIR' },
    { hsnCode: '9101290000', description: 'WRIST WATCH WITH OUT BATTERY' },
    { hsnCode: '904210000', description: 'DRY CHILLI' },
    { hsnCode: '6116920000', description: 'HAND GLOVES' },
    { hsnCode: '9506992580', description: 'CRICKET BAT' },
    { hsnCode: '9506610000', description: 'TENNISBALL' },
    { hsnCode: '9506991200', description: 'Badminton Shuttlecocks' },
    { hsnCode: '9506594040', description: 'Badminton Rackets' },
    { hsnCode: '9506512000', description: 'TENNIS RACKETS' },
    { hsnCode: '4016920000', description: 'ERASER' },
    { hsnCode: '9609109000', description: 'WRITING PENCIL' },
    { hsnCode: '9608100000', description: 'WRITING PENS' },
    { hsnCode: '4901100000', description: 'PRINTED BOOKS' },
    { hsnCode: '4820104000', description: 'NOTE BOOKS' },
    { hsnCode: '4602112100', description: 'LADIES WEAR HAND BAG' },
    { hsnCode: '6110202079', description: 'Ladies Sweater (100% cotton, knitted)' },
    { hsnCode: '6117102030', description: 'Ladies Scarf (knitted)' },
    { hsnCode: '9603100500', description: 'PAINT BRUSH' },
    { hsnCode: '4202921000', description: 'EMPTY JUTE BAG ( MADE OF 100% COTTON KNITTED )' },
    { hsnCode: '7407103000', description: 'Bronze Medal' },
    { hsnCode: '9619001000', description: 'SANITORY PAD' },
    { hsnCode: '9004900000', description: 'SPECTACLES' },
    { hsnCode: '8212100000', description: 'RAZOR  for shaving' },
    { hsnCode: '6302219010', description: 'BED SHEET(MADE OF 100% COTTON).' },
    { hsnCode: '6302213040', description: 'PILLOW COVERS KNITTED' },
    { hsnCode: '5204110000', description: 'COTTON THEREAD' },
    { hsnCode: '7323930060', description: 'Idly Cooker' },
    { hsnCode: '3920590000', description: 'PLASTIC SNACKS MAKER' },
    { hsnCode: '6302910005', description: 'KIDS NAPKINS' },
    { hsnCode: '4911998000', description: 'DOCUMENTS' },
  ];
};

export const searchHSN = async (query: string): Promise<HSNItem[]> => {
  const data = await loadHSNData();
  if (!query) return data.slice(0, 50); // Return first 50 if no query
  
  const lowerQuery = query.toLowerCase();
  return data.filter(item => 
    item.hsnCode.toLowerCase().includes(lowerQuery) ||
    item.description.toLowerCase().includes(lowerQuery)
  ).slice(0, 50);
};

export const getHSNByCode = async (code: string): Promise<HSNItem | null> => {
  const data = await loadHSNData();
  return data.find(item => item.hsnCode === code) || null;
};

