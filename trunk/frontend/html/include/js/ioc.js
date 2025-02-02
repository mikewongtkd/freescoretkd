/* 
 * Mix of IOC data and ISO3166; where there are conflicts, IOC wins. 
 * https://en.wikipedia.org/wiki/List_of_IOC_country_codes
 * https://en.wikipedia.org/wiki/Comparison_of_alphabetic_country_codes
 * */
let ioc = {
   data : {
      "country" : {
         "ARU" : {
            "name" : "Aruba",
            "num" : "533",
            "ioc" : "ARU",
            "two" : "AW"
         },
         "AFG" : {
            "name" : "Afghanistan",
            "num" : "004",
            "ioc" : "AFG",
            "two" : "AF"
         },
         "ANG" : {
            "name" : "Angola",
            "num" : "024",
            "ioc" : "ANG",
            "two" : "AO"
         },
         "ALB" : {
            "name" : "Albania",
            "num" : "008",
            "ioc" : "ALB",
            "two" : "AL"
         },
         "AND" : {
            "name" : "Andorra",
            "num" : "020",
            "ioc" : "AND",
            "two" : "AD"
         },
         "UAE" : {
            "name" : "United Arab Emirates (the)",
            "num" : "784",
            "ioc" : "UAE",
            "two" : "AE"
         },
         "ARG" : {
            "name" : "Argentina",
            "num" : "032",
            "ioc" : "ARG",
            "two" : "AR"
         },
         "ARM" : {
            "name" : "Armenia",
            "num" : "051",
            "ioc" : "ARM",
            "two" : "AM"
         },
         "ASA" : {
            "name" : "American Samoa",
            "num" : "016",
            "ioc" : "ASA",
            "two" : "AS"
         },
         "ANT" : {
            "name" : "Antigua and Barbuda",
            "num" : "028",
            "ioc" : "ANT",
            "two" : "AG"
         },
         "AUS" : {
            "name" : "Australia",
            "num" : "036",
            "ioc" : "AUS",
            "two" : "AU"
         },
         "AUT" : {
            "name" : "Austria",
            "num" : "040",
            "ioc" : "AUT",
            "two" : "AT"
         },
         "AZE" : {
            "name" : "Azerbaijan",
            "num" : "031",
            "ioc" : "AZE",
            "two" : "AZ"
         },
         "BDI" : {
            "name" : "Burundi",
            "num" : "108",
            "ioc" : "BDI",
            "two" : "BI"
         },
         "BEL" : {
            "name" : "Belgium",
            "num" : "056",
            "ioc" : "BEL",
            "two" : "BE"
         },
         "BEN" : {
            "name" : "Benin",
            "num" : "204",
            "ioc" : "BEN",
            "two" : "BJ"
         },
         "BUR" : {
            "name" : "Burkina Faso",
            "num" : "854",
            "ioc" : "BUR",
            "two" : "BF"
         },
         "BAN" : {
            "name" : "Bangladesh",
            "num" : "050",
            "ioc" : "BAN",
            "two" : "BD"
         },
         "BUL" : {
            "name" : "Bulgaria",
            "num" : "100",
            "ioc" : "BUL",
            "two" : "BG"
         },
         "BRN" : {
            "name" : "Bahrain",
            "num" : "048",
            "ioc" : "BRN",
            "two" : "BH"
         },
         "BAH" : {
            "name" : "Bahamas (the)",
            "num" : "044",
            "ioc" : "BAH",
            "two" : "BS"
         },
         "BIH" : {
            "name" : "Bosnia and Herzegovina",
            "num" : "070",
            "ioc" : "BIH",
            "two" : "BA"
         },
         "BLR" : {
            "name" : "Belarus",
            "num" : "112",
            "ioc" : "BLR",
            "two" : "BY"
         },
         "BIZ" : {
            "name" : "Belize",
            "num" : "084",
            "ioc" : "BIZ",
            "two" : "BZ"
         },
         "BER" : {
            "name" : "Bermuda",
            "num" : "060",
            "ioc" : "BER",
            "two" : "BM"
         },
         "BOL" : {
            "name" : "Bolivia (Plurinational State of)",
            "num" : "068",
            "ioc" : "BOL",
            "two" : "BO"
         },
         "BRA" : {
            "name" : "Brazil",
            "num" : "076",
            "ioc" : "BRA",
            "two" : "BR"
         },
         "BAR" : {
            "name" : "Barbados",
            "num" : "052",
            "ioc" : "BAR",
            "two" : "BB"
         },
         "BRU" : {
            "name" : "Brunei Darussalam",
            "num" : "096",
            "ioc" : "BRU",
            "two" : "BN"
         },
         "BHU" : {
            "name" : "Bhutan",
            "num" : "064",
            "ioc" : "BHU",
            "two" : "BT"
         },
         "BOT" : {
            "name" : "Botswana",
            "num" : "072",
            "ioc" : "BOT",
            "two" : "BW"
         },
         "CAF" : {
            "name" : "Central African Republic (the)",
            "num" : "140",
            "ioc" : "CAF",
            "two" : "CF"
         },
         "CAN" : {
            "name" : "Canada",
            "num" : "124",
            "ioc" : "CAN",
            "two" : "CA"
         },
         "CHE" : {
            "name" : "Switzerland",
            "num" : "756",
            "ioc" : "CHE",
            "two" : "CH"
         },
         "CHI" : {
            "name" : "Chile",
            "num" : "152",
            "ioc" : "CHI",
            "two" : "CL"
         },
         "CHN" : {
            "name" : "China",
            "num" : "156",
            "ioc" : "CHN",
            "two" : "CN"
         },
         "CIV" : {
            "name" : "Côte d'Ivoire",
            "num" : "384",
            "ioc" : "CIV",
            "two" : "CI"
         },
         "CMR" : {
            "name" : "Cameroon",
            "num" : "120",
            "ioc" : "CMR",
            "two" : "CM"
         },
         "COD" : {
            "name" : "Congo (the Democratic Republic of the)",
            "num" : "180",
            "ioc" : "COD",
            "two" : "CD"
         },
         "CGO" : {
            "name" : "Congo (the)",
            "num" : "178",
            "ioc" : "CGO",
            "two" : "CG"
         },
         "COK" : {
            "name" : "Cook Islands (the)",
            "num" : "184",
            "ioc" : "COK",
            "two" : "CK"
         },
         "COL" : {
            "name" : "Colombia",
            "num" : "170",
            "ioc" : "COL",
            "two" : "CO"
         },
         "COM" : {
            "name" : "Comoros (the)",
            "num" : "174",
            "ioc" : "COM",
            "two" : "KM"
         },
         "CPV" : {
            "name" : "Cabo Verde",
            "num" : "132",
            "ioc" : "CPV",
            "two" : "CV"
         },
         "CRC" : {
            "name" : "Costa Rica",
            "num" : "188",
            "ioc" : "CRC",
            "two" : "CR"
         },
         "CUB" : {
            "name" : "Cuba",
            "num" : "192",
            "ioc" : "CUB",
            "two" : "CU"
         },
         "CAY" : {
            "name" : "Cayman Islands (the)",
            "num" : "136",
            "ioc" : "CAY",
            "two" : "KY"
         },
         "CYP" : {
            "name" : "Cyprus",
            "num" : "196",
            "ioc" : "CYP",
            "two" : "CY"
         },
         "CZE" : {
            "name" : "Czechia",
            "num" : "203",
            "ioc" : "CZE",
            "two" : "CZ"
         },
         "GER" : {
            "name" : "Germany",
            "num" : "276",
            "ioc" : "GER",
            "two" : "DE"
         },
         "DJI" : {
            "name" : "Djibouti",
            "num" : "262",
            "ioc" : "DJI",
            "two" : "DJ"
         },
         "DMA" : {
            "name" : "Dominica",
            "num" : "212",
            "ioc" : "DMA",
            "two" : "DM"
         },
         "DEN" : {
            "name" : "Denmark",
            "num" : "208",
            "ioc" : "DEN",
            "two" : "DK"
         },
         "DOM" : {
            "name" : "Dominican Republic (the)",
            "num" : "214",
            "ioc" : "DOM",
            "two" : "DO"
         },
         "ALG" : {
            "name" : "Algeria",
            "num" : "012",
            "ioc" : "ALG",
            "two" : "DZ"
         },
         "ECU" : {
            "name" : "Ecuador",
            "num" : "218",
            "ioc" : "ECU",
            "two" : "EC"
         },
         "EGY" : {
            "name" : "Egypt",
            "num" : "818",
            "ioc" : "EGY",
            "two" : "EG"
         },
         "ERI" : {
            "name" : "Eritrea",
            "num" : "232",
            "ioc" : "ERI",
            "two" : "ER"
         },
         "ESP" : {
            "name" : "Spain",
            "num" : "724",
            "ioc" : "ESP",
            "two" : "ES"
         },
         "EST" : {
            "name" : "Estonia",
            "num" : "233",
            "ioc" : "EST",
            "two" : "EE"
         },
         "ETH" : {
            "name" : "Ethiopia",
            "num" : "231",
            "ioc" : "ETH",
            "two" : "ET"
         },
         "FIN" : {
            "name" : "Finland",
            "num" : "246",
            "ioc" : "FIN",
            "two" : "FI"
         },
         "FIJ" : {
            "name" : "Fiji",
            "num" : "242",
            "ioc" : "FIJ",
            "two" : "FJ"
         },
         "FRA" : {
            "name" : "France",
            "num" : "250",
            "ioc" : "FRA",
            "two" : "FR"
         },
         "FSM" : {
            "name" : "Micronesia (Federated States of)",
            "num" : "583",
            "ioc" : "FSM",
            "two" : "FM"
         },
         "GAB" : {
            "name" : "Gabon",
            "num" : "266",
            "ioc" : "GAB",
            "two" : "GA"
         },
         "GBR" : {
            "name" : "United Kingdom of Great Britain and Northern Ireland (the)",
            "num" : "826",
            "ioc" : "GBR",
            "two" : "GB"
         },
         "GEO" : {
            "name" : "Georgia",
            "num" : "268",
            "ioc" : "GEO",
            "two" : "GE"
         },
         "GHA" : {
            "name" : "Ghana",
            "num" : "288",
            "ioc" : "GHA",
            "two" : "GH"
         },
         "GUI" : {
            "name" : "Guinea",
            "num" : "324",
            "ioc" : "GUI",
            "two" : "GN"
         },
         "GAM" : {
            "name" : "Gambia (the)",
            "num" : "270",
            "ioc" : "GAM",
            "two" : "GM"
         },
         "GBS" : {
            "name" : "Guinea-Bissau",
            "num" : "624",
            "ioc" : "GBS",
            "two" : "GW"
         },
         "GEQ" : {
            "name" : "Equatorial Guinea",
            "num" : "226",
            "ioc" : "GEQ",
            "two" : "GQ"
         },
         "GRE" : {
            "name" : "Greece",
            "num" : "300",
            "ioc" : "GRE",
            "two" : "GR"
         },
         "GRN" : {
            "name" : "Grenada",
            "num" : "308",
            "ioc" : "GRN",
            "two" : "GD"
         },
         "GUA" : {
            "name" : "Guatemala",
            "num" : "320",
            "ioc" : "GUA",
            "two" : "GT"
         },
         "GUM" : {
            "name" : "Guam",
            "num" : "316",
            "ioc" : "GUM",
            "two" : "GU"
         },
         "GUY" : {
            "name" : "Guyana",
            "num" : "328",
            "ioc" : "GUY",
            "two" : "GY"
         },
         "HKG" : {
            "name" : "Hong Kong",
            "num" : "344",
            "ioc" : "HKG",
            "two" : "HK"
         },
         "HND" : {
            "name" : "Honduras",
            "num" : "340",
            "ioc" : "HND",
            "two" : "HN"
         },
         "CRO" : {
            "name" : "Croatia",
            "num" : "191",
            "ioc" : "CRO",
            "two" : "HR"
         },
         "HAI" : {
            "name" : "Haiti",
            "num" : "332",
            "ioc" : "HAI",
            "two" : "HT"
         },
         "HUN" : {
            "name" : "Hungary",
            "num" : "348",
            "ioc" : "HUN",
            "two" : "HU"
         },
         "INA" : {
            "name" : "Indonesia",
            "num" : "360",
            "ioc" : "INA",
            "two" : "ID"
         },
         "IND" : {
            "name" : "India",
            "num" : "356",
            "ioc" : "IND",
            "two" : "IN"
         },
         "IRL" : {
            "name" : "Ireland",
            "num" : "372",
            "ioc" : "IRL",
            "two" : "IE"
         },
         "IRI" : {
            "name" : "Iran (Islamic Republic of)",
            "num" : "364",
            "ioc" : "IRI",
            "two" : "IR"
         },
         "IRQ" : {
            "name" : "Iraq",
            "num" : "368",
            "ioc" : "IRQ",
            "two" : "IQ"
         },
         "ISL" : {
            "name" : "Iceland",
            "num" : "352",
            "ioc" : "ISL",
            "two" : "IS"
         },
         "ISR" : {
            "name" : "Israel",
            "num" : "376",
            "ioc" : "ISR",
            "two" : "IL"
         },
         "ITA" : {
            "name" : "Italy",
            "num" : "380",
            "ioc" : "ITA",
            "two" : "IT"
         },
         "JAM" : {
            "name" : "Jamaica",
            "num" : "388",
            "ioc" : "JAM",
            "two" : "JM"
         },
         "JOR" : {
            "name" : "Jordan",
            "num" : "400",
            "ioc" : "JOR",
            "two" : "JO"
         },
         "JPN" : {
            "name" : "Japan",
            "num" : "392",
            "ioc" : "JPN",
            "two" : "JP"
         },
         "KAZ" : {
            "name" : "Kazakhstan",
            "num" : "398",
            "ioc" : "KAZ",
            "two" : "KZ"
         },
         "KEN" : {
            "name" : "Kenya",
            "num" : "404",
            "ioc" : "KEN",
            "two" : "KE"
         },
         "KGZ" : {
            "name" : "Kyrgyzstan",
            "num" : "417",
            "ioc" : "KGZ",
            "two" : "KG"
         },
         "CAM" : {
            "name" : "Cambodia",
            "num" : "116",
            "ioc" : "CAM",
            "two" : "KH"
         },
         "KIR" : {
            "name" : "Kiribati",
            "num" : "296",
            "ioc" : "KIR",
            "two" : "KI"
         },
         "SKN" : {
            "name" : "Saint Kitts and Nevis",
            "num" : "659",
            "ioc" : "SKN",
            "two" : "KN"
         },
         "KOR" : {
            "name" : "Korea (the Republic of)",
            "num" : "410",
            "ioc" : "KOR",
            "two" : "KR"
         },
         "KOS" : {
            "name" : "Kosovo",
            "num" : null,
            "ioc" : "KOS",
            "two" : "KO"
         },
         "KUW" : {
            "name" : "Kuwait",
            "num" : "414",
            "ioc" : "KUW",
            "two" : "KW"
         },
         "LAO" : {
            "name" : "Lao People's Democratic Republic (the)",
            "num" : "418",
            "ioc" : "LAO",
            "two" : "LA"
         },
         "LBN" : {
            "name" : "Lebanon",
            "num" : "422",
            "ioc" : "LBN",
            "two" : "LB"
         },
         "LBR" : {
            "name" : "Liberia",
            "num" : "430",
            "ioc" : "LBR",
            "two" : "LR"
         },
         "LBA" : {
            "name" : "Libya",
            "num" : "434",
            "ioc" : "LBA",
            "two" : "LY"
         },
         "LCA" : {
            "name" : "Saint Lucia",
            "num" : "662",
            "ioc" : "LCA",
            "two" : "LC"
         },
         "LIE" : {
            "name" : "Liechtenstein",
            "num" : "438",
            "ioc" : "LIE",
            "two" : "LI"
         },
         "SRI" : {
            "name" : "Sri Lanka",
            "num" : "144",
            "ioc" : "SRI",
            "two" : "LK"
         },
         "LES" : {
            "name" : "Lesotho",
            "num" : "426",
            "ioc" : "LES",
            "two" : "LS"
         },
         "LTU" : {
            "name" : "Lithuania",
            "num" : "440",
            "ioc" : "LTU",
            "two" : "LT"
         },
         "LUX" : {
            "name" : "Luxembourg",
            "num" : "442",
            "ioc" : "LUX",
            "two" : "LU"
         },
         "LAT" : {
            "name" : "Latvia",
            "num" : "428",
            "ioc" : "LAT",
            "two" : "LV"
         },
         "MAC" : {
            "name" : "Macao",
            "num" : "446",
            "ioc" : "MAC",
            "two" : "MO"
         },
         "MAR" : {
            "name" : "Morocco",
            "num" : "504",
            "ioc" : "MAR",
            "two" : "MA"
         },
         "MON" : {
            "name" : "Monaco",
            "num" : "492",
            "ioc" : "MON",
            "two" : "MC"
         },
         "MDA" : {
            "name" : "Moldova (the Republic of)",
            "num" : "498",
            "ioc" : "MDA",
            "two" : "MD"
         },
         "MAD" : {
            "name" : "Madagascar",
            "num" : "450",
            "ioc" : "MAD",
            "two" : "MG"
         },
         "MDV" : {
            "name" : "Maldives",
            "num" : "462",
            "ioc" : "MDV",
            "two" : "MV"
         },
         "MEX" : {
            "name" : "Mexico",
            "num" : "484",
            "ioc" : "MEX",
            "two" : "MX"
         },
         "MHL" : {
            "name" : "Marshall Islands (the)",
            "num" : "584",
            "ioc" : "MHL",
            "two" : "MH"
         },
         "MKD" : {
            "name" : "Republic of North Macedonia",
            "num" : "807",
            "ioc" : "MKD",
            "two" : "MK"
         },
         "MLI" : {
            "name" : "Mali",
            "num" : "466",
            "ioc" : "MLI",
            "two" : "ML"
         },
         "MLT" : {
            "name" : "Malta",
            "num" : "470",
            "ioc" : "MLT",
            "two" : "MT"
         },
         "MYA" : {
            "name" : "Myanmar",
            "num" : "104",
            "ioc" : "MYA",
            "two" : "MM"
         },
         "MNE" : {
            "name" : "Montenegro",
            "num" : "499",
            "ioc" : "MNE",
            "two" : "ME"
         },
         "MNG" : {
            "name" : "Mongolia",
            "num" : "496",
            "ioc" : "MNG",
            "two" : "MN"
         },
         "MOZ" : {
            "name" : "Mozambique",
            "num" : "508",
            "ioc" : "MOZ",
            "two" : "MZ"
         },
         "MTN" : {
            "name" : "Mauritania",
            "num" : "478",
            "ioc" : "MTN",
            "two" : "MR"
         },
         "MRI" : {
            "name" : "Mauritius",
            "num" : "480",
            "ioc" : "MRI",
            "two" : "MU"
         },
         "MAW" : {
            "name" : "Malawi",
            "num" : "454",
            "ioc" : "MAW",
            "two" : "MW"
         },
         "MAS" : {
            "name" : "Malaysia",
            "num" : "458",
            "ioc" : "MAS",
            "two" : "MY"
         },
         "NAM" : {
            "name" : "Namibia",
            "num" : "516",
            "ioc" : "NAM",
            "two" : "NA"
         },
         "NER" : {
            "name" : "Niger (the)",
            "num" : "562",
            "ioc" : "NER",
            "two" : "NE"
         },
         "NGR" : {
            "name" : "Nigeria",
            "num" : "566",
            "ioc" : "NGR",
            "two" : "NG"
         },
         "NCA" : {
            "name" : "Nicaragua",
            "num" : "558",
            "ioc" : "NCA",
            "two" : "NI"
         },
         "NIU" : {
            "name" : "Niue",
            "num" : "570",
            "ioc" : "NIU",
            "two" : "NU"
         },
         "NED" : {
            "name" : "Netherlands (the)",
            "num" : "528",
            "ioc" : "NED",
            "two" : "NL"
         },
         "NOR" : {
            "name" : "Norway",
            "num" : "578",
            "ioc" : "NOR",
            "two" : "NO"
         },
         "NEP" : {
            "name" : "Nepal",
            "num" : "524",
            "ioc" : "NEP",
            "two" : "NP"
         },
         "NRU" : {
            "name" : "Nauru",
            "num" : "520",
            "ioc" : "NRU",
            "two" : "NR"
         },
         "NZL" : {
            "name" : "New Zealand",
            "num" : "554",
            "ioc" : "NZL",
            "two" : "NZ"
         },
         "OMA" : {
            "name" : "Oman",
            "num" : "512",
            "ioc" : "OMA",
            "two" : "OM"
         },
         "PAK" : {
            "name" : "Pakistan",
            "num" : "586",
            "ioc" : "PAK",
            "two" : "PK"
         },
         "PAN" : {
            "name" : "Panama",
            "num" : "591",
            "ioc" : "PAN",
            "two" : "PA"
         },
         "PER" : {
            "name" : "Peru",
            "num" : "604",
            "ioc" : "PER",
            "two" : "PE"
         },
         "PHI" : {
            "name" : "Philippines (the)",
            "num" : "608",
            "ioc" : "PHI",
            "two" : "PH"
         },
         "PLW" : {
            "name" : "Palau",
            "num" : "585",
            "ioc" : "PLW",
            "two" : "PW"
         },
         "PNG" : {
            "name" : "Papua New Guinea",
            "num" : "598",
            "ioc" : "PNG",
            "two" : "PG"
         },
         "POL" : {
            "name" : "Poland",
            "num" : "616",
            "ioc" : "POL",
            "two" : "PL"
         },
         "PRI" : {
            "name" : "Puerto Rico",
            "num" : "630",
            "ioc" : "PRI",
            "two" : "PR"
         },
         "PRK" : {
            "name" : "Korea (the Democratic People's Republic of)",
            "num" : "408",
            "ioc" : "PRK",
            "two" : "KP"
         },
         "POR" : {
            "name" : "Portugal",
            "num" : "620",
            "ioc" : "POR",
            "two" : "PT"
         },
         "PAR" : {
            "name" : "Paraguay",
            "num" : "600",
            "ioc" : "PAR",
            "two" : "PY"
         },
         "PLE" : {
            "name" : "Palestine, State of",
            "num" : "275",
            "ioc" : "PLE",
            "two" : "PS"
         },
         "QAT" : {
            "name" : "Qatar",
            "num" : "634",
            "ioc" : "QAT",
            "two" : "QA"
         },
         "ROU" : {
            "name" : "Romania",
            "num" : "642",
            "ioc" : "ROU",
            "two" : "RO"
         },
         "RUS" : {
            "name" : "Russian Federation (the)",
            "num" : "643",
            "ioc" : "RUS",
            "two" : "RU"
         },
         "RWA" : {
            "name" : "Rwanda",
            "num" : "646",
            "ioc" : "RWA",
            "two" : "RW"
         },
         "KSA" : {
            "name" : "Saudi Arabia",
            "num" : "682",
            "ioc" : "KSA",
            "two" : "SA"
         },
         "SUD" : {
            "name" : "Sudan (the)",
            "num" : "729",
            "ioc" : "SUD",
            "two" : "SD"
         },
         "SEN" : {
            "name" : "Senegal",
            "num" : "686",
            "ioc" : "SEN",
            "two" : "SN"
         },
         "SGP" : {
            "name" : "Singapore",
            "num" : "702",
            "ioc" : "SGP",
            "two" : "SG"
         },
         "SOL" : {
            "name" : "Solomon Islands",
            "num" : "090",
            "ioc" : "SOL",
            "two" : "SB"
         },
         "SLE" : {
            "name" : "Sierra Leone",
            "num" : "694",
            "ioc" : "SLE",
            "two" : "SL"
         },
         "ESA" : {
            "name" : "El Salvador",
            "num" : "222",
            "ioc" : "ESA",
            "two" : "SV"
         },
         "SMR" : {
            "name" : "San Marino",
            "num" : "674",
            "ioc" : "SMR",
            "two" : "SM"
         },
         "SOM" : {
            "name" : "Somalia",
            "num" : "706",
            "ioc" : "SOM",
            "two" : "SO"
         },
         "SRB" : {
            "name" : "Serbia",
            "num" : "688",
            "ioc" : "SRB",
            "two" : "RS"
         },
         "SSD" : {
            "name" : "South Sudan",
            "num" : "728",
            "ioc" : "SSD",
            "two" : "SS"
         },
         "STP" : {
            "name" : "Sao Tome and Principe",
            "num" : "678",
            "ioc" : "STP",
            "two" : "ST"
         },
         "SUR" : {
            "name" : "Suriname",
            "num" : "740",
            "ioc" : "SUR",
            "two" : "SR"
         },
         "SVK" : {
            "name" : "Slovakia",
            "num" : "703",
            "ioc" : "SVK",
            "two" : "SK"
         },
         "SLO" : {
            "name" : "Slovenia",
            "num" : "705",
            "ioc" : "SLO",
            "two" : "SI"
         },
         "SWE" : {
            "name" : "Sweden",
            "num" : "752",
            "ioc" : "SWE",
            "two" : "SE"
         },
         "SWZ" : {
            "name" : "Eswatini",
            "num" : "748",
            "ioc" : "SWZ",
            "two" : "SZ"
         },
         "SEY" : {
            "name" : "Seychelles",
            "num" : "690",
            "ioc" : "SEY",
            "two" : "SC"
         },
         "SYR" : {
            "name" : "Syrian Arab Republic",
            "num" : "760",
            "ioc" : "SYR",
            "two" : "SY"
         },
         "CHA" : {
            "name" : "Chad",
            "num" : "148",
            "ioc" : "CHA",
            "two" : "TD"
         },
         "TOG" : {
            "name" : "Togo",
            "num" : "768",
            "ioc" : "TOG",
            "two" : "TG"
         },
         "THA" : {
            "name" : "Thailand",
            "num" : "764",
            "ioc" : "THA",
            "two" : "TH"
         },
         "TJK" : {
            "name" : "Tajikistan",
            "num" : "762",
            "ioc" : "TJK",
            "two" : "TJ"
         },
         "TKM" : {
            "name" : "Turkmenistan",
            "num" : "795",
            "ioc" : "TKM",
            "two" : "TM"
         },
         "TLS" : {
            "name" : "Timor-Leste",
            "num" : "626",
            "ioc" : "TLS",
            "two" : "TL"
         },
         "TGA" : {
            "name" : "Tonga",
            "num" : "776",
            "ioc" : "TGA",
            "two" : "TO"
         },
         "TTO" : {
            "name" : "Trinidad and Tobago",
            "num" : "780",
            "ioc" : "TTO",
            "two" : "TT"
         },
         "TUN" : {
            "name" : "Tunisia",
            "num" : "788",
            "ioc" : "TUN",
            "two" : "TN"
         },
         "TUR" : {
            "name" : "Turkey",
            "num" : "792",
            "ioc" : "TUR",
            "two" : "TR"
         },
         "TUV" : {
            "name" : "Tuvalu",
            "num" : "798",
            "ioc" : "TUV",
            "two" : "TV"
         },
         "TPE" : {
            "name" : "Taiwan (Province of China)",
            "num" : "158",
            "ioc" : "TPE",
            "two" : "TW"
         },
         "TAN" : {
            "name" : "Tanzania, United Republic of",
            "num" : "834",
            "ioc" : "TAN",
            "two" : "TZ"
         },
         "UGA" : {
            "name" : "Uganda",
            "num" : "800",
            "ioc" : "UGA",
            "two" : "UG"
         },
         "UKR" : {
            "name" : "Ukraine",
            "num" : "804",
            "ioc" : "UKR",
            "two" : "UA"
         },
         "URU" : {
            "name" : "Uruguay",
            "num" : "858",
            "ioc" : "URU",
            "two" : "UY"
         },
         "USA" : {
            "name" : "United States of America (the)",
            "num" : "840",
            "ioc" : "USA",
            "two" : "US"
         },
         "UZB" : {
            "name" : "Uzbekistan",
            "num" : "860",
            "ioc" : "UZB",
            "two" : "UZ"
         },
         "VAT" : {
            "name" : "Holy See (the)",
            "num" : "336",
            "ioc" : "VAT",
            "two" : "VA"
         },
         "VIN" : {
            "name" : "Saint Vincent and the Grenadines",
            "num" : "670",
            "ioc" : "VIN",
            "two" : "VC"
         },
         "VEN" : {
            "name" : "Venezuela (Bolivarian Republic of)",
            "num" : "862",
            "ioc" : "VEN",
            "two" : "VE"
         },
         "IVB" : {
            "name" : "Virgin Islands (British)",
            "num" : "092",
            "ioc" : "IVB",
            "two" : "VG"
         },
         "ISV" : {
            "name" : "Virgin Islands (U.S.)",
            "num" : "850",
            "ioc" : "ISV",
            "two" : "VI"
         },
         "VIE" : {
            "name" : "Viet Nam",
            "num" : "704",
            "ioc" : "VIE",
            "two" : "VN"
         },
         "VAN" : {
            "name" : "Vanuatu",
            "num" : "548",
            "ioc" : "VAN",
            "two" : "VU"
         },
         "SAM" : {
            "name" : "Samoa",
            "num" : "882",
            "ioc" : "SAM",
            "two" : "WS"
         },
         "YEM" : {
            "name" : "Yemen",
            "num" : "887",
            "ioc" : "YEM",
            "two" : "YE"
         },
         "RSA" : {
            "name" : "South Africa",
            "num" : "710",
            "ioc" : "RSA",
            "two" : "ZA"
         },
         "ZAM" : {
            "name" : "Zambia",
            "num" : "894",
            "ioc" : "ZAM",
            "two" : "ZM"
         },
         "ZIM" : {
            "name" : "Zimbabwe",
            "num" : "716",
            "ioc" : "ZIM",
            "two" : "ZW"
         }
      },
      "lookup" : {
         "AD" : "AND",
         "AE" : "UAE",
         "AF" : "AFG",
         "AG" : "ANT",
         "AL" : "ALB",
         "AM" : "ARM",
         "AO" : "ANG",
         "AR" : "ARG",
         "AS" : "ASA",
         "AT" : "AUT",
         "AU" : "AUS",
         "AW" : "ARU",
         "AZ" : "AZE",
         "Afghanistan" : "AFG",
         "Albania" : "ALB",
         "Algeria" : "ALG",
         "American Samoa" : "ASA",
         "Andorra" : "AND",
         "Angola" : "ANG",
         "Antigua and Barbuda" : "ANT",
         "Argentina" : "ARG",
         "Armenia" : "ARM",
         "Aruba" : "ARU",
         "Australia" : "AUS",
         "Austria" : "AUT",
         "Azerbaijan" : "AZE",
         "BA" : "BIH",
         "BB" : "BAR",
         "BD" : "BAN",
         "BE" : "BEL",
         "BF" : "BUR",
         "BG" : "BUL",
         "BH" : "BRN",
         "BI" : "BDI",
         "BJ" : "BEN",
         "BM" : "BER",
         "BN" : "BRU",
         "BO" : "BOL",
         "BR" : "BRA",
         "BS" : "BAH",
         "BT" : "BHU",
         "BW" : "BOT",
         "BY" : "BLR",
         "BZ" : "BIZ",
         "Bahamas (the)" : "BAH",
         "Bahrain" : "BRN",
         "Bangladesh" : "BAN",
         "Barbados" : "BAR",
         "Belarus" : "BLR",
         "Belgium" : "BEL",
         "Belize" : "BIZ",
         "Benin" : "BEN",
         "Bermuda" : "BER",
         "Bhutan" : "BHU",
         "Bolivia (Plurinational State of)" : "BOL",
         "Bosnia and Herzegovina" : "BIH",
         "Botswana" : "BOT",
         "Brazil" : "BRA",
         "Brunei Darussalam" : "BRU",
         "Bulgaria" : "BUL",
         "Burkina Faso" : "BUR",
         "Burundi" : "BDI",
         "CA" : "CAN",
         "CD" : "COD",
         "CF" : "CAF",
         "CG" : "CGO",
         "CH" : "CHE",
         "CI" : "CIV",
         "CK" : "COK",
         "CL" : "CHI",
         "CM" : "CMR",
         "CN" : "CHN",
         "CO" : "COL",
         "CR" : "CRC",
         "CU" : "CUB",
         "CV" : "CPV",
         "CY" : "CYP",
         "CZ" : "CZE",
         "Cabo Verde" : "CPV",
         "Cambodia" : "CAM",
         "Cameroon" : "CMR",
         "Canada" : "CAN",
         "Cayman Islands (the)" : "CAY",
         "Central African Republic (the)" : "CAF",
         "Chad" : "CHA",
         "Chile" : "CHI",
         "China" : "CHN",
         "Colombia" : "COL",
         "Comoros (the)" : "COM",
         "Congo (the Democratic Republic of the)" : "COD",
         "Congo (the)" : "CGO",
         "Cook Islands (the)" : "COK",
         "Costa Rica" : "CRC",
         "Croatia" : "CRO",
         "Cuba" : "CUB",
         "Cyprus" : "CYP",
         "Czechia" : "CZE",
         "Côte d'Ivoire" : "CIV",
         "DE" : "GER",
         "DJ" : "DJI",
         "DK" : "DEN",
         "DM" : "DMA",
         "DO" : "DOM",
         "DZ" : "DZA",
         "Denmark" : "DEN",
         "Djibouti" : "DJI",
         "Dominica" : "DMA",
         "Dominican Republic (the)" : "DOM",
         "EC" : "ECU",
         "EE" : "EST",
         "EG" : "EGY",
         "ER" : "ERI",
         "ES" : "ESP",
         "ET" : "ETH",
         "Ecuador" : "ECU",
         "Egypt" : "EGY",
         "El Salvador" : "ESA",
         "Equatorial Guinea" : "GEQ",
         "Eritrea" : "ERI",
         "Estonia" : "EST",
         "Eswatini" : "SWZ",
         "Ethiopia" : "ETH",
         "FI" : "FIN",
         "FJ" : "FIJ",
         "FM" : "FSM",
         "FR" : "FRA",
         "Fiji" : "FIJ",
         "Finland" : "FIN",
         "France" : "FRA",
         "GA" : "GAB",
         "GB" : "GBR",
         "GD" : "GRN",
         "GE" : "GEO",
         "GH" : "GHA",
         "GM" : "GAM",
         "GN" : "GUI",
         "GQ" : "GEQ",
         "GR" : "GRE",
         "GT" : "GUA",
         "GU" : "GUM",
         "GW" : "GBS",
         "GY" : "GUY",
         "Gabon" : "GAB",
         "Gambia (the)" : "GAM",
         "Georgia" : "GEO",
         "Germany" : "GER",
         "Ghana" : "GHA",
         "Greece" : "GRE",
         "Grenada" : "GRN",
         "Guam" : "GUM",
         "Guatemala" : "GUA",
         "Guinea" : "GUI",
         "Guinea-Bissau" : "GBS",
         "Guyana" : "GUY",
         "HK" : "HKG",
         "HN" : "HND",
         "HR" : "CRO",
         "HT" : "HAI",
         "HU" : "HUN",
         "Haiti" : "HAI",
         "Holy See (the)" : "VAT",
         "Honduras" : "HND",
         "Hong Kong" : "HKG",
         "Hungary" : "HUN",
         "ID" : "INA",
         "IE" : "IRL",
         "IL" : "ISR",
         "IN" : "IND",
         "IQ" : "IRQ",
         "IR" : "IRI",
         "IS" : "ISL",
         "IT" : "ITA",
         "Iceland" : "ISL",
         "India" : "IND",
         "Indonesia" : "INA",
         "Iran (Islamic Republic of)" : "IRI",
         "Iraq" : "IRQ",
         "Ireland" : "IRL",
         "Israel" : "ISR",
         "Italy" : "ITA",
         "JM" : "JAM",
         "JO" : "JOR",
         "JP" : "JPN",
         "Jamaica" : "JAM",
         "Japan" : "JPN",
         "Jordan" : "JOR",
         "KE" : "KEN",
         "KG" : "KGZ",
         "KH" : "CAM",
         "KI" : "KIR",
         "KM" : "COM",
         "KN" : "SKN",
         "KP" : "PRK",
         "KR" : "KOR",
         "KW" : "KUW",
         "KY" : "CAY",
         "KZ" : "KAZ",
         "Kazakhstan" : "KAZ",
         "Kenya" : "KEN",
         "Kiribati" : "KIR",
         "Korea (the Democratic People's Republic of)" : "PRK",
         "Korea (the Republic of)" : "KOR",
         "Kuwait" : "KUW",
         "Kyrgyzstan" : "KGZ",
         "LA" : "LAO",
         "LB" : "LBN",
         "LC" : "LCA",
         "LI" : "LIE",
         "LK" : "SRI",
         "LR" : "LBR",
         "LS" : "LES",
         "LT" : "LTU",
         "LU" : "LUX",
         "LV" : "LAT",
         "LY" : "LBA",
         "Lao People's Democratic Republic (the)" : "LAO",
         "Latvia" : "LAT",
         "Lebanon" : "LBN",
         "Lesotho" : "LES",
         "Liberia" : "LBR",
         "Libya" : "LBA",
         "Liechtenstein" : "LIE",
         "Lithuania" : "LTU",
         "Luxembourg" : "LUX",
         "MA" : "MAR",
         "MC" : "MON",
         "MD" : "MDA",
         "ME" : "MNE",
         "MG" : "MAD",
         "MH" : "MHL",
         "MK" : "MKD",
         "ML" : "MLI",
         "MM" : "MYA",
         "MN" : "MNG",
         "MO" : "MAC",
         "MQ" : "MTQ",
         "MR" : "MTN",
         "MT" : "MLT",
         "MU" : "MRI",
         "MV" : "MDV",
         "MW" : "MAW",
         "MX" : "MEX",
         "MY" : "MAS",
         "MZ" : "MOZ",
         "Macao" : "MAC",
         "Madagascar" : "MAD",
         "Malawi" : "MAW",
         "Malaysia" : "MAS",
         "Maldives" : "MDV",
         "Mali" : "MLI",
         "Malta" : "MLT",
         "Marshall Islands (the)" : "MHL",
         "Mauritania" : "MTN",
         "Mauritius" : "MRI",
         "Mexico" : "MEX",
         "Micronesia (Federated States of)" : "FSM",
         "Moldova (the Republic of)" : "MDA",
         "Monaco" : "MON",
         "Mongolia" : "MNG",
         "Montenegro" : "MNE",
         "Morocco" : "MAR",
         "Mozambique" : "MOZ",
         "Myanmar" : "MYA",
         "NA" : "NAM",
         "NE" : "NER",
         "NG" : "NGR",
         "NI" : "NCA",
         "NL" : "NED",
         "NO" : "NOR",
         "NP" : "NEP",
         "NR" : "NRU",
         "NU" : "NIU",
         "NZ" : "NZL",
         "Namibia" : "NAM",
         "Nauru" : "NRU",
         "Nepal" : "NEP",
         "Netherlands (the)" : "NED",
         "New Zealand" : "NZL",
         "Nicaragua" : "NCA",
         "Niger (the)" : "NER",
         "Nigeria" : "NGR",
         "Niue" : "NIU",
         "Norway" : "NOR",
         "OM" : "OMA",
         "Oman" : "OMA",
         "PA" : "PAN",
         "PE" : "PER",
         "PG" : "PNG",
         "PH" : "PHI",
         "PK" : "PAK",
         "PL" : "POL",
         "PR" : "PRI",
         "PS" : "PLE",
         "PT" : "POR",
         "PW" : "PLW",
         "PY" : "PAR",
         "Pakistan" : "PAK",
         "Palau" : "PLW",
         "Palestine, State of" : "PLE",
         "Panama" : "PAN",
         "Papua New Guinea" : "PNG",
         "Paraguay" : "PAR",
         "Peru" : "PER",
         "Philippines (the)" : "PHI",
         "Poland" : "POL",
         "Portugal" : "POR",
         "Puerto Rico" : "PRI",
         "QA" : "QAT",
         "Qatar" : "QAT",
         "RO" : "ROU",
         "RS" : "SRB",
         "RU" : "RUS",
         "RW" : "RWA",
         "Republic of North Macedonia" : "MKD",
         "Romania" : "ROU",
         "Russian Federation (the)" : "RUS",
         "Rwanda" : "RWA",
         "SA" : "KSA",
         "SB" : "SOL",
         "SC" : "SEY",
         "SD" : "SUD",
         "SE" : "SWE",
         "SG" : "SGP",
         "SI" : "SLO",
         "SK" : "SVK",
         "SL" : "SLE",
         "SM" : "SMR",
         "SN" : "SEN",
         "SO" : "SOM",
         "SR" : "SUR",
         "SS" : "SSD",
         "ST" : "STP",
         "SV" : "ESA",
         "SY" : "SYR",
         "SZ" : "SWZ",
         "Saint Kitts and Nevis" : "SKN",
         "Saint Lucia" : "LCA",
         "Saint Vincent and the Grenadines" : "VIN",
         "Samoa" : "SAM",
         "San Marino" : "SMR",
         "Sao Tome and Principe" : "STP",
         "Saudi Arabia" : "KSA",
         "Senegal" : "SEN",
         "Serbia" : "SRB",
         "Seychelles" : "SEY",
         "Sierra Leone" : "SLE",
         "Singapore" : "SGP",
         "Slovakia" : "SVK",
         "Slovenia" : "SLO",
         "Solomon Islands" : "SOL",
         "Somalia" : "SOM",
         "South Africa" : "RSA",
         "South Sudan" : "SSD",
         "Spain" : "ESP",
         "Sri Lanka" : "SRI",
         "Sudan (the)" : "SUD",
         "Suriname" : "SUR",
         "Sweden" : "SWE",
         "Switzerland" : "CHE",
         "Syrian Arab Republic" : "SYR",
         "TD" : "CHA",
         "TG" : "TOG",
         "TH" : "THA",
         "TJ" : "TJK",
         "TL" : "TLS",
         "TM" : "TKM",
         "TN" : "TUN",
         "TO" : "TGA",
         "TR" : "TUR",
         "TT" : "TTO",
         "TV" : "TUV",
         "TW" : "TPE",
         "TZ" : "TAN",
         "Taiwan (Province of China)" : "TPE",
         "Tajikistan" : "TJK",
         "Tanzania, United Republic of" : "TAN",
         "Thailand" : "THA",
         "Timor-Leste" : "TLS",
         "Togo" : "TOG",
         "Tonga" : "TGA",
         "Trinidad and Tobago" : "TTO",
         "Tunisia" : "TUN",
         "Turkey" : "TUR",
         "Turkmenistan" : "TKM",
         "Tuvalu" : "TUV",
         "UA" : "UKR",
         "UG" : "UGA",
         "US" : "USA",
         "UY" : "URU",
         "UZ" : "UZB",
         "Uganda" : "UGA",
         "Ukraine" : "UKR",
         "United Arab Emirates (the)" : "UAE",
         "United Kingdom of Great Britain and Northern Ireland (the)" : "GBR",
         "United States of America (the)" : "USA",
         "Uruguay" : "URU",
         "Uzbekistan" : "UZB",
         "VA" : "VAT",
         "VC" : "VIN",
         "VE" : "VEN",
         "VG" : "IVB",
         "VI" : "ISV",
         "VN" : "VIE",
         "VU" : "VAN",
         "Vanuatu" : "VAN",
         "Venezuela (Bolivarian Republic of)" : "VEN",
         "Viet Nam" : "VIE",
         "Virgin Islands (British)" : "IVB",
         "Virgin Islands (U.S.)" : "ISV",
         "WS" : "SAM",
         "YE" : "YEM",
         "Yemen" : "YEM",
         "ZA" : "RSA",
         "ZM" : "ZAM",
         "ZW" : "ZIM",
         "Zambia" : "ZAM",
         "Zimbabwe" : "ZIM",
      }
   },
   flag : text => {
      let entry = ioc.lookup( text );
      if( entry === undefined ) { return undefined; }
      return `/images/flags/${entry.two.toLowerCase()}.png`;
   },
   lookup : text => {
      if( text === undefined || text === null ) { return undefined; }

      let uc = text.toUpperCase();
      if( uc in ioc.data.country ) { return ioc.data.country[ uc ]; }

      if( text in ioc.data.lookup ) { 
         let ioc = ioc.data.lookup[ text ];
         return ioc.data?.country?.[ ioc ];
      }

      if( uc in ioc.data.lookup ) {
         let ioc = ioc.data.lookup[ uc ];
         return ioc.data?.country?.[ ioc ];
      }
   }
};
