// Cơ sở dữ liệu địa lý toàn diện của 63 Tỉnh/Thành phố trực thuộc Trung ương của Việt Nam
export const PROVINCE_MAP: Record<string, { name: string; coords: [number, number]; searchTerms: string[] }> = {
  hanoi: {
    name: "Hà Nội",
    coords: [105.8542, 21.0285],
    searchTerms: ["ha noi", "hà nội", "hanoi"],
  },
  haiphong: {
    name: "Hải Phòng",
    coords: [106.6881, 20.8449],
    searchTerms: ["hai phong", "hải phòng", "haiphong"],
  },
  bacninh: {
    name: "Bắc Ninh",
    coords: [106.0763, 21.1861],
    searchTerms: ["bac ninh", "bắc ninh", "bacninh"],
  },
  hanam: {
    name: "Hà Nam",
    coords: [105.9128, 20.5422],
    searchTerms: ["ha nam", "hà nam", "hanam"],
  },
  haiduong: {
    name: "Hải Dương",
    coords: [106.3147, 20.9382],
    searchTerms: ["hai duong", "hải dương", "haiduong"],
  },
  hungyen: {
    name: "Hưng Yên",
    coords: [106.0511, 20.6464],
    searchTerms: ["hung yen", "hưng yên", "hungyen"],
  },
  namdinh: {
    name: "Nam Định",
    coords: [106.1684, 20.42],
    searchTerms: ["nam dinh", "nam định", "namdinh"],
  },
  ninhbinh: {
    name: "Ninh Bình",
    coords: [105.9745, 20.2506],
    searchTerms: ["ninh binh", "ninh bình", "ninhbinh"],
  },
  thaibinh: {
    name: "Thái Bình",
    coords: [106.3364, 20.4462],
    searchTerms: ["thai binh", "thái bình", "thaibinh"],
  },
  vinhphuc: {
    name: "Vĩnh Phúc",
    coords: [105.5968, 21.3089],
    searchTerms: ["vinh phuc", "vĩnh phúc", "vinhphuc"],
  },
  hagiang: {
    name: "Hà Giang",
    coords: [104.9835, 22.8233],
    searchTerms: ["ha giang", "hà giang", "hagiang"],
  },
  caobang: {
    name: "Cao Bằng",
    coords: [106.2575, 22.6662],
    searchTerms: ["cao bang", "cao bằng", "caobang"],
  },
  backan: {
    name: "Bắc Kạn",
    coords: [105.8339, 22.1469],
    searchTerms: ["bac kan", "bắc kạn", "backan", "bac can", "bắc cạn"],
  },
  langson: {
    name: "Lạng Sơn",
    coords: [106.7618, 21.8548],
    searchTerms: ["lang son", "lạng sơn", "langson"],
  },
  tuyenquang: {
    name: "Tuyên Quang",
    coords: [105.2131, 21.8152],
    searchTerms: ["tuyen quang", "tuyên quang", "tuyenquang"],
  },
  thainguyen: {
    name: "Thái Nguyên",
    coords: [105.8481, 21.5939],
    searchTerms: ["thai nguyen", "thái nguyên", "thainguyen"],
  },
  phutho: {
    name: "Phú Thọ",
    coords: [105.4018, 21.3214],
    searchTerms: ["phu tho", "phú thọ", "phutho"],
  },
  bacgiang: {
    name: "Bắc Giang",
    coords: [106.1946, 21.2731],
    searchTerms: ["bac giang", "bắc giang", "bacgiang"],
  },
  quangninh: {
    name: "Quảng Ninh",
    coords: [107.0734, 20.9502],
    searchTerms: ["quang ninh", "quảng ninh", "quangninh", "ha long", "hạ long"],
  },
  laocai: {
    name: "Lào Cai",
    coords: [103.9707, 22.4856],
    searchTerms: ["lao cai", "lào cai", "laocai", "sapa"],
  },
  yenbai: {
    name: "Yên Bái",
    coords: [104.8741, 21.7049],
    searchTerms: ["yen bai", "yên bái", "yenbai"],
  },
  dienbien: {
    name: "Điện Biên",
    coords: [103.0211, 21.3858],
    searchTerms: ["dien bien", "điện biên", "dienbien"],
  },
  hoabinh: {
    name: "Hòa Bình",
    coords: [105.3377, 20.8172],
    searchTerms: ["hoa binh", "hòa bình", "hoabinh"],
  },
  laichau: {
    name: "Lai Châu",
    coords: [103.4623, 22.3957],
    searchTerms: ["lai chau", "lai châu", "laichau"],
  },
  sonla: {
    name: "Sơn La",
    coords: [103.9168, 21.3291],
    searchTerms: ["son la", "sơn la", "sonla"],
  },
  thanhhoa: {
    name: "Thanh Hóa",
    coords: [105.7852, 19.8067],
    searchTerms: ["thanh hoa", "thanh hóa", "thanhhoa"],
  },
  nghean: {
    name: "Nghệ An",
    coords: [105.6814, 18.6736],
    searchTerms: ["nghe an", "nghệ an", "nghean", "vinh"],
  },
  hatinh: {
    name: "Hà Tĩnh",
    coords: [105.9056, 18.3429],
    searchTerms: ["ha tinh", "hà tĩnh", "hatinh"],
  },
  quangbinh: {
    name: "Quảng Bình",
    coords: [106.6262, 17.4655],
    searchTerms: ["quang binh", "quảng bình", "quangbinh", "dong hoi", "đồng hới"],
  },
  quangtri: {
    name: "Quảng Trị",
    coords: [107.1009, 16.8149],
    searchTerms: ["quang tri", "quảng trị", "quangtri", "dong ha", "đông hà"],
  },
  thuathienhue: {
    name: "Thừa Thiên Huế",
    coords: [107.5909, 16.4637],
    searchTerms: ["thua thien hue", "thừa thiên huế", "hue", "huế"],
  },
  danang: {
    name: "Đà Nẵng",
    coords: [108.2022, 16.0544],
    searchTerms: ["da nang", "đà nẵng", "danang"],
  },
  quangnam: {
    name: "Quảng Nam",
    coords: [108.4811, 15.5662],
    searchTerms: ["quang nam", "quảng nam", "quangnam", "tam ky", "tam kỳ", "hoi an", "hội an"],
  },
  quangngai: {
    name: "Quảng Ngãi",
    coords: [108.8014, 15.1205],
    searchTerms: ["quang ngai", "quảng ngãi", "quangngai"],
  },
  binhdinh: {
    name: "Bình Định",
    coords: [109.2194, 13.783],
    searchTerms: ["binh dinh", "bình định", "binhdinh", "quynhon", "quy nhơn"],
  },
  phuyen: {
    name: "Phú Yên",
    coords: [109.3134, 13.0911],
    searchTerms: ["phu yen", "phú yên", "phuyen", "tuyhoa", "tuy hòa"],
  },
  khanhhoa: {
    name: "Khánh Hòa",
    coords: [109.1967, 12.2388],
    searchTerms: ["khanh hoa", "khánh hòa", "khanhhoa", "nhatrang", "nha trang"],
  },
  ninhthuan: {
    name: "Ninh Thuận",
    coords: [108.9904, 11.5644],
    searchTerms: ["ninh thuan", "ninh thuận", "ninhthuan", "phanrang", "phan rang"],
  },
  binhthuan: {
    name: "Bình Thuận",
    coords: [108.1009, 10.9322],
    searchTerms: ["binh thuan", "bình thuận", "binhthuan", "phan thiet", "phan thiết"],
  },
  kontum: {
    name: "Kon Tum",
    coords: [108.0003, 14.3497],
    searchTerms: ["kon tum", "kontum"],
  },
  gialai: {
    name: "Gia Lai",
    coords: [107.9944, 13.9822],
    searchTerms: ["gia lai", "gialai", "pleiku"],
  },
  daklak: {
    name: "Đắk Lắk",
    coords: [108.0383, 12.6667],
    searchTerms: ["dak lak", "đắk lắk", "daklak", "buon ma thuot", "buôn ma thuột"],
  },
  daknong: {
    name: "Đắk Nông",
    coords: [107.6922, 11.9868],
    searchTerms: ["dak nong", "đắk nông", "daknong"],
  },
  lamdong: {
    name: "Lâm Đồng",
    coords: [108.4583, 11.9404],
    searchTerms: ["lam dong", "lâm đồng", "lamdong", "dalat", "đà lạt"],
  },
  hcmc: {
    name: "TP. Hồ Chí Minh",
    coords: [106.7009, 10.7769],
    searchTerms: ["ho chi minh", "hồ chí minh", "hcm", "saigon", "sài gòn"],
  },
  bariavungtau: {
    name: "Bà Rịa - Vũng Tàu",
    coords: [107.0843, 10.346],
    searchTerms: ["ba ria", "bà rịa", "vung tau", "vũng tàu", "bariavungtau"],
  },
  binhduong: {
    name: "Bình Dương",
    coords: [106.6519, 10.9804],
    searchTerms: ["binh duong", "bình dương", "binhduong"],
  },
  binhphuoc: {
    name: "Bình Phước",
    coords: [106.8847, 11.5325],
    searchTerms: ["binh phuoc", "bình phước", "binhphuoc"],
  },
  dongnai: {
    name: "Đồng Nai",
    coords: [106.8427, 10.9575],
    searchTerms: ["dong nai", "đồng nai", "dongnai", "bien hoa", "biên hòa"],
  },
  tayninh: {
    name: "Tây Ninh",
    coords: [106.0988, 11.3129],
    searchTerms: ["tay ninh", "tây ninh", "tayninh"],
  },
  cantho: {
    name: "Cần Thơ",
    coords: [105.7469, 10.0452],
    searchTerms: ["can tho", "cần thơ", "cantho"],
  },
  angiang: {
    name: "An Giang",
    coords: [105.4339, 10.3725],
    searchTerms: ["an giang", "an giang", "angiang"],
  },
  baclieu: {
    name: "Bạc Liêu",
    coords: [105.7244, 9.2942],
    searchTerms: ["bac lieu", "bạc liêu", "baclieu"],
  },
  bentre: {
    name: "Bến Tre",
    coords: [106.3756, 10.2411],
    searchTerms: ["ben tre", "bến tre", "bentre"],
  },
  camau: {
    name: "Cà Mau",
    coords: [105.1522, 9.1764],
    searchTerms: ["ca mau", "cà mau", "camau"],
  },
  dongthap: {
    name: "Đồng Tháp",
    coords: [105.6364, 10.4552],
    searchTerms: ["dong thap", "đồng tháp", "dongthap", "cao lanh", "cao lãnh"],
  },
  haugiang: {
    name: "Hậu Giang",
    coords: [105.4704, 9.7844],
    searchTerms: ["hau giang", "hậu giang", "haugiang"],
  },
  kiengiang: {
    name: "Kiên Giang",
    coords: [105.0817, 9.9614],
    searchTerms: ["kien giang", "kiên giang", "kiengiang", "rach gia", "rạch giá"],
  },
  longan: {
    name: "Long An",
    coords: [106.4069, 10.5339],
    searchTerms: ["long an", "long an", "longan", "tan an", "tân an"],
  },
  soctrang: {
    name: "Sóc Trăng",
    coords: [105.9733, 9.5997],
    searchTerms: ["soc trang", "sóc trăng", "soctrang"],
  },
  tiengiang: {
    name: "Tiền Giang",
    coords: [106.3653, 10.3597],
    searchTerms: ["tien giang", "tiền giang", "tiengiang", "my tho", "mỹ tho"],
  },
  travinh: {
    name: "Trà Vinh",
    coords: [106.3347, 9.9367],
    searchTerms: ["tra vinh", "trà vinh", "travinh"],
  },
  vinhlong: {
    name: "Vĩnh Long",
    coords: [105.9708, 10.2528],
    searchTerms: ["vinh long", "vĩnh long", "vinhlong"],
  },
};
