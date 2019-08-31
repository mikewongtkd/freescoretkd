<div class="pt-page pt-page-1 page-checkin">
	<div class="page-header">
		<div class="page-header-content">Athlete Check-in <div class="pull-right" id="clock"></div> <a class="btn btn-xs btn-success pull-right" id="announcer"> Announcer Disabled</a> </div>
	</div>
	<h2>Divisions Being Staged</h2>
	<table id="divisions-view">
	</table>
	<h2>Athletes Being Staged</h2>
	<table id="athletes-view">
	</table>
</div>
<script>
var update = {};
update.registration = { "athletes" : { "06fabebd" : { "age" : "11", "belt" : "Red Belt with Black Stripe", "gender" : "Female", "name" : "Mindy CHO", "weight" : "0" }, "07092d69" : { "age" : "12", "belt" : "Red Belt", "gender" : "Male", "name" : "Jonathan LE", "weight" : "36.4" }, "0b12d914" : { "age" : "12", "belt" : "Red Belt", "gender" : "Female", "name" : "Heidi WU", "weight" : "48.2" }, "0cc69a24" : { "age" : "15", "belt" : "Green Belt with Black Stripe", "gender" : "Male", "name" : "Daniel HUNG", "weight" : "0" }, "1583148b" : { "age" : "6", "belt" : "White Belt with Purple Stripe", "gender" : "Male", "name" : "Jawahar BHATIA", "weight" : "0" }, "180336d5" : { "age" : "9", "belt" : "Green Belt with Black Stripe", "gender" : "Female", "name" : "Mary KREHMEYER", "weight" : "0" }, "1998b8f2" : { "age" : "9", "belt" : "White Belt with Yellow Stripe", "gender" : "Male", "name" : "Tushar MANN", "weight" : "27.7" }, "1e5cc00f" : { "age" : "10", "belt" : "Green Belt", "gender" : "Male", "name" : "Schuyler KOVACEK", "weight" : "0" }, "29dcc4b5" : { "age" : "14", "belt" : "Black Belt", "gender" : "Male", "name" : "Gajendra PATIL", "weight" : "65.9" }, "29e178de" : { "age" : "11", "belt" : "Green Belt", "gender" : "Male", "name" : "Kyler BAHRINGER", "weight" : "44.1" }, "2cc8c1d6" : { "age" : "16", "belt" : "Red Belt with Black Stripe", "gender" : "Male", "name" : "Mahmood MISRA", "weight" : "56.8" }, "323ad0c7" : { "age" : "8", "belt" : "Yellow Belt with White Stripe", "gender" : "Male", "name" : "Khoa TRAN", "weight" : "30.5" }, "3483c2d8" : { "age" : "11", "belt" : "Red Belt", "gender" : "Male", "name" : "Don WISOZK", "weight" : "44.1" }, "351e8dc9" : { "age" : "9", "belt" : "Blue Belt", "gender" : "Female", "name" : "Pranay BARIA", "weight" : "0" }, "3ae8555e" : { "age" : "9", "belt" : "Brown Belt", "gender" : "Male", "name" : "Bernhard JACOBI", "weight" : "0" }, "3d2527c6" : { "age" : "16", "belt" : "Brown Belt", "gender" : "Female", "name" : "Gabrielle LOVE", "weight" : "61.4" }, "3ec50faa" : { "age" : "5", "belt" : "Yellow Belt with White Stripe", "gender" : "Male", "name" : "Spencer KUPHAL", "weight" : "0" }, "3fc14823" : { "age" : "9", "belt" : "Blue Belt with Black Stripe", "gender" : "Female", "name" : "Ericka EBERLY", "weight" : "44.5" }, "4171b60e" : { "age" : "9", "belt" : "Orange Belt", "gender" : "Female", "name" : "Georgia MIKLOSOVIC", "weight" : "21.8" }, "457a2241" : { "age" : "6", "belt" : "White Belt with Yellow Stripe", "gender" : "Male", "name" : "Fausto JONES", "weight" : "15.9" }, "464256f4" : { "age" : "9", "belt" : "Blue Belt with Black Stripe", "gender" : "Male", "name" : "Dwight SCHUPPE", "weight" : "24.1" }, "4b4c8b00" : { "age" : "8", "belt" : "Yellow Belt with White Stripe", "gender" : "Male", "name" : "Preet MAND", "weight" : "19.1" }, "4e04c61f" : { "age" : "7", "belt" : "Green Belt", "gender" : "Male", "name" : "Ricky KIM", "weight" : "0" }, "516ec6b7" : { "age" : "13", "belt" : "Red Belt", "gender" : "Male", "name" : "Jatin CHANDRAN", "weight" : "39.5" }, "51eb6cae" : { "age" : "15", "belt" : "Brown Belt", "gender" : "Male", "name" : "Jaden WANG", "weight" : "74.5" }, "53e6ebe8" : { "age" : "9", "belt" : "Brown Belt", "gender" : "Male", "name" : "Nick EMARD", "weight" : "22.3" }, "54d56e55" : { "age" : "9", "belt" : "White Belt with Purple Stripe", "gender" : "Female", "name" : "Kimberly WONG", "weight" : "26.4" }, "593d4573" : { "age" : "11", "belt" : "Blue Belt", "gender" : "Female", "name" : "Michaela SCRUGGS", "weight" : "0" }, "65b5b64b" : { "age" : "11", "belt" : "Red Belt with Black Stripe", "gender" : "Male", "name" : "Daniel WEI", "weight" : "29.5" }, "67d12ef1" : { "age" : "10", "belt" : "Purple Belt", "gender" : "Male", "name" : "Juan BELTRAN", "weight" : "21.8" }, "6b8ba5f5" : { "age" : "7", "belt" : "Yellow Belt with White Stripe", "gender" : "Female", "name" : "Akshay SURESH", "weight" : "0" }, "6e63734b" : { "age" : "8", "belt" : "White Belt with Orange Stripe", "gender" : "Female", "name" : "Pravin BHAGAT", "weight" : "26" }, "6f7ed5ac" : { "age" : "14", "belt" : "Red Belt with Black Stripe", "gender" : "Male", "name" : "Edwin HUYNH", "weight" : "0" }, "729782c7" : { "age" : "11", "belt" : "Green Belt", "gender" : "Male", "name" : "Joshuah PROHASKA", "weight" : "34.4" }, "7986fc7d" : { "age" : "49", "belt" : "Red Belt", "gender" : "Male", "name" : "Jimmy BROADHURST", "weight" : "70.5" }, "7a76da9b" : { "age" : "12", "belt" : "Yellow Belt with White Stripe", "gender" : "Male", "name" : "Aadil NADKARNI", "weight" : "50.9" }, "7cd68c80" : { "age" : "9", "belt" : "Orange Belt with Black Stripe", "gender" : "Female", "name" : "Thu GINSBERG", "weight" : "31.4" }, "7cf0e9f4" : { "age" : "10", "belt" : "White Belt", "gender" : "Female", "name" : "Alyssa HOANG", "weight" : "0" }, "7d4ef0e2" : { "age" : "6", "belt" : "White Belt with Yellow Stripe", "gender" : "Male", "name" : "Jason SPENCER", "weight" : "23.2" }, "80d663b9" : { "age" : "15", "belt" : "Black Belt", "gender" : "Male", "name" : "Alec LANG", "weight" : "60.7" }, "83186146" : { "age" : "7", "belt" : "White Belt with Blue Stripe", "gender" : "Female", "name" : "Toni DROSE", "weight" : "0" }, "864436cc" : { "age" : "14", "belt" : "Yellow Belt with Orange Stripe", "gender" : "Male", "name" : "Wafa SETH", "weight" : "0" }, "8702a204" : { "age" : "9", "belt" : "Purple Belt", "gender" : "Female", "name" : "Kashia KIEF", "weight" : "0" }, "898a9257" : { "age" : "9", "belt" : "Yellow Belt with White Stripe", "gender" : "Female", "name" : "Hanuman RANGANATHAN", "weight" : "0" }, "8aba8398" : { "age" : "11", "belt" : "Red Belt", "gender" : "Male", "name" : "Harpreet KRISH", "weight" : "24.1" }, "8da2800b" : { "age" : "7", "belt" : "White Belt", "gender" : "Female", "name" : "Natalie NELSON", "weight" : "0" }, "8f299faa" : { "age" : "10", "belt" : "Blue Belt", "gender" : "Female", "name" : "Jacqueline PAK", "weight" : "0" }, "91792656" : { "age" : "16", "belt" : "Blue Belt", "gender" : "Female", "name" : "Bhairavi RANDHAWA", "weight" : "0" }, "986541b7" : { "age" : "8", "belt" : "White Belt with Yellow Stripe", "gender" : "Male", "name" : "Skylar KUMAR", "weight" : "0" }, "9c30e7f6" : { "age" : "15", "belt" : "Brown Belt with Black Stripe", "gender" : "Male", "name" : "Rishi GALVAN", "weight" : "48.6" }, "9fee443e" : { "age" : "12", "belt" : "Yellow Belt with Orange Stripe", "gender" : "Male", "name" : "Luc MARTIN", "weight" : "30.9" }, "a13201bf" : { "age" : "11", "belt" : "Yellow Belt with Orange Stripe", "gender" : "Female", "name" : "Mohit JAGGI", "weight" : "0" }, "a2c12771" : { "age" : "14", "belt" : "Green Belt", "gender" : "Female", "name" : "Faith NGUYEN", "weight" : "40.9" }, "a4e855d9" : { "age" : "7", "belt" : "White Belt with Yellow Stripe", "gender" : "Male", "name" : "Arnoldo GRANT", "weight" : "0" }, "a8df5cd6" : { "age" : "17", "belt" : "Black Belt", "gender" : "Male", "name" : "Tony LEE", "weight" : "61.4" }, "aa4f987c" : { "age" : "11", "belt" : "Orange Belt", "gender" : "Male", "name" : "Lakshmi SUNDER", "weight" : "49.1" }, "ace5df4e" : { "age" : "17", "belt" : "Red Belt with Black Stripe", "gender" : "Male", "name" : "Bryan WU", "weight" : "86.4" }, "afb2adc6" : { "age" : "11", "belt" : "Black Belt", "gender" : "Male", "name" : "Arun KAPUR", "weight" : "36.4" }, "b760aaf3" : { "age" : "7", "belt" : "White Belt", "gender" : "Male", "name" : "Blake XIONG", "weight" : "21.8" }, "be99ee32" : { "age" : "6", "belt" : "Orange Belt", "gender" : "Female", "name" : "Feroz NIGAM", "weight" : "20.5" }, "cbfa8eae" : { "age" : "36", "belt" : "Black Belt", "gender" : "Male", "name" : "Sahil MENON", "weight" : "72.7" }, "cc51edad" : { "age" : "8", "belt" : "Yellow Belt with Orange Stripe", "gender" : "Male", "name" : "Min SEO", "weight" : "0" }, "d084b54b" : { "age" : "10", "belt" : "Purple Belt", "gender" : "Male", "name" : "Jaleel RENNER", "weight" : "40.1" }, "d1b73883" : { "age" : "7", "belt" : "White Belt with Yellow Stripe", "gender" : "Female", "name" : "Rachel PHOUMINH", "weight" : "24.5" }, "d4ef1436" : { "age" : "7", "belt" : "White Belt with Yellow Stripe", "gender" : "Male", "name" : "Americo LITTLE", "weight" : "0" }, "d63de921" : { "age" : "9", "belt" : "Yellow Belt with Orange Stripe", "gender" : "Female", "name" : "Amanda AKIYAMA", "weight" : "0" }, "d7549b06" : { "age" : "12", "belt" : "Red Belt", "gender" : "Male", "name" : "Kamron ROOB", "weight" : "36.4" }, "e5cda4e0" : { "age" : "9", "belt" : "Green Belt", "gender" : "Female", "name" : "Valerie VISWAROOPAN", "weight" : "0" }, "e71a3e04" : { "age" : "11", "belt" : "White Belt with Yellow Stripe", "gender" : "Male", "name" : "Aniruddh TATA", "weight" : "0" }, "e7620c7c" : { "age" : "35", "belt" : "Green Belt", "gender" : "Male", "name" : "Lee NGUYEN", "weight" : "76.4" }, "ed255d68" : { "age" : "16", "belt" : "Red Belt", "gender" : "Male", "name" : "Maverick LYNCH", "weight" : "60.5" }, "edc6cf0d" : { "age" : "14", "belt" : "Red Belt with Black Stripe", "gender" : "Male", "name" : "Ekbal GODA", "weight" : "0" }, "f222407f" : { "age" : "11", "belt" : "Brown Belt", "gender" : "Female", "name" : "Cheyanne GERSHOVICH", "weight" : "0" }, "f242c732" : { "age" : "6", "belt" : "White Belt with Green Stripe", "gender" : "Male", "name" : "Dell JACOBSON", "weight" : "0" }, "f2abd403" : { "age" : "8", "belt" : "Yellow Belt with White Stripe", "gender" : "Female", "name" : "Mallory TARBELL", "weight" : "20.5" }, "f32aad78" : { "age" : "13", "belt" : "Red Belt with Black Stripe", "gender" : "Female", "name" : "Sushmita BRAHMBHATT", "weight" : "0" }, "f3339801" : { "age" : "6", "belt" : "White Belt with Yellow Stripe", "gender" : "Female", "name" : "Lisa CANFIELD", "weight" : "0" }, "f3c564ab" : { "age" : "13", "belt" : "Red Belt with Black Stripe", "gender" : "Male", "name" : "Zackary ADAMS", "weight" : "41.4" }, "f9b7bcd4" : { "age" : "12", "belt" : "Red Belt with Black Stripe", "gender" : "Female", "name" : "Katelyn YAO", "weight" : "43.2" } }, "checkin" : { "kp01a" : { "1583148b" : false, "f242c732" : false, "f3339801" : false }, "kp01b" : { "83186146" : false, "d1b73883" : false }, "kp01c" : { "a4e855d9" : false, "b760aaf3" : false, "d4ef1436" : false }, "kp01d" : { "323ad0c7" : false, "6e63734b" : false, "986541b7" : false }, "kp01e" : { "1998b8f2" : false, "54d56e55" : false }, "kp01f" : { "7cf0e9f4" : false, "e71a3e04" : false }, "oc01a" : { "1583148b" : false, "7d4ef0e2" : false, "be99ee32" : false }, "oc01b" : { "3ec50faa" : false, "457a2241" : false, "f242c732" : false }, "oc02a" : { "6b8ba5f5" : false, "8da2800b" : false }, "oc02b" : { "a4e855d9" : false, "b760aaf3" : false, "d4ef1436" : false }, "oc03" : { "4b4c8b00" : false, "cc51edad" : false, "f2abd403" : false }, "oc04" : { "1998b8f2" : false, "54d56e55" : false, "7cd68c80" : false, "898a9257" : false }, "oc05a" : { "06fabebd" : false, "7cf0e9f4" : false, "a13201bf" : false }, "oc05b" : { "1e5cc00f" : false, "65b5b64b" : false, "67d12ef1" : false, "8aba8398" : false }, "pb01" : { "898a9257" : false, "d1b73883" : false }, "pb02a" : { "67d12ef1" : false, "d084b54b" : false }, "pb02b" : { "29e178de" : false, "3fc14823" : false, "aa4f987c" : false }, "pb03a" : { "29dcc4b5" : false, "51eb6cae" : false, "ace5df4e" : false }, "pb03b" : { "3d2527c6" : false, "80d663b9" : false, "ed255d68" : false }, "pb03c" : { "3483c2d8" : false, "f3c564ab" : false }, "pb03d" : { "65b5b64b" : false, "afb2adc6" : false }, "pp01a" : { "cc51edad" : false, "f2abd403" : false }, "pp01b" : { "7cd68c80" : false, "898a9257" : false }, "pp02a" : { "180336d5" : false, "8702a204" : false }, "pp02b" : { "464256f4" : false, "67d12ef1" : false }, "pp03a" : { "06fabebd" : false, "65b5b64b" : false, "8aba8398" : false }, "pp03b" : { "07092d69" : false, "516ec6b7" : false, "d7549b06" : false, "edc6cf0d" : false, "f32aad78" : false }, "pp03c" : { "2cc8c1d6" : false, "3d2527c6" : false }, "pp04" : { "7986fc7d" : false }, "sb01a" : { "29e178de" : false, "729782c7" : false }, "sb01b" : { "29dcc4b5" : false, "51eb6cae" : false }, "sp01" : { "29e178de" : false, "464256f4" : false }, "sp02" : { "0b12d914" : false, "29e178de" : false }, "sp03" : { "29dcc4b5" : false, "51eb6cae" : false }, "sp04" : { "29dcc4b5" : false, "a8df5cd6" : false }, "tp01a" : { "6b8ba5f5" : false, "be99ee32" : false }, "tp01b" : { "323ad0c7" : false, "4b4c8b00" : false, "cc51edad" : false }, "tp01c" : { "898a9257" : false, "d63de921" : false, "f2abd403" : false }, "tp01d" : { "4171b60e" : false, "7cd68c80" : false }, "tp01e" : { "a13201bf" : false, "aa4f987c" : false }, "tp01f" : { "864436cc" : false, "9fee443e" : false }, "tp02a" : { "351e8dc9" : false, "4e04c61f" : false, "e5cda4e0" : false }, "tp02b" : { "1e5cc00f" : false, "d084b54b" : false }, "tp02c" : { "593d4573" : false, "8f299faa" : false }, "tp02d" : { "0cc69a24" : false, "91792656" : false }, "tp03a" : { "3ae8555e" : false, "53e6ebe8" : false }, "tp03b" : { "0b12d914" : false, "f222407f" : false, "f9b7bcd4" : false }, "tp03c" : { "07092d69" : false, "516ec6b7" : false, "8aba8398" : false, "f3c564ab" : false }, "tp03d" : { "6f7ed5ac" : false, "9c30e7f6" : false, "ed255d68" : false }, "tp04" : { "e7620c7c" : false }, "ws01a" : { "7a76da9b" : false, "a2c12771" : false }, "ws01b" : { "29dcc4b5" : false, "80d663b9" : false, "cbfa8eae" : false } }, "divisions" : { "kp01a" : { "description" : "6yo Beginner", "event" : "dc19a65e", "id" : "kp01a", "ring" : 1, "start" : "10:00 AM" }, "kp01b" : { "description" : "7yo Female Beginner", "event" : "dc19a65e", "id" : "kp01b", "ring" : 2, "start" : "10:00 AM" }, "kp01c" : { "description" : "7yo Male Beginner", "event" : "dc19a65e", "id" : "kp01c", "ring" : 2, "start" : "10:04 AM" }, "kp01d" : { "description" : "8yo Beginner", "event" : "dc19a65e", "id" : "kp01d", "ring" : 1, "start" : "10:08 AM" }, "kp01e" : { "description" : "9yo Beginner", "event" : "dc19a65e", "id" : "kp01e", "ring" : 2, "start" : "10:12 AM" }, "kp01f" : { "description" : "10-11 Beginner", "event" : "dc19a65e", "id" : "kp01f", "ring" : 1, "start" : "10:16 AM" }, "oc01a" : { "description" : "5-6 Beginner [Group A]", "event" : "b7aa4a12", "id" : "oc01a", "ring" : 1, "start" : "9:00 AM" }, "oc01b" : { "description" : "5-6 Beginner [Group B]", "event" : "b7aa4a12", "id" : "oc01b", "ring" : 2, "start" : "9:00 AM" }, "oc02a" : { "description" : "7yo Female Beginner", "event" : "b7aa4a12", "id" : "oc02a", "ring" : 1, "start" : "9:12 AM" }, "oc02b" : { "description" : "7yo Male Beginner", "event" : "b7aa4a12", "id" : "oc02b", "ring" : 2, "start" : "9:12 AM" }, "oc03" : { "description" : "8yo Beginner", "event" : "b7aa4a12", "id" : "oc03", "ring" : 1, "start" : "9:20 AM" }, "oc04" : { "description" : "9yo Beginner", "event" : "b7aa4a12", "id" : "oc04", "ring" : 2, "start" : "9:24 AM" }, "oc05a" : { "description" : "10-11 Female", "event" : "b7aa4a12", "id" : "oc05a", "ring" : 1, "start" : "9:32 AM" }, "oc05b" : { "description" : "10-11 Male", "event" : "b7aa4a12", "id" : "oc05b", "ring" : 2, "start" : "9:40 AM" }, "pb01" : { "description" : "Beginner", "event" : "ccdbd64f", "id" : "pb01", "ring" : 1, "start" : "1:00 PM" }, "pb02a" : { "description" : "Light Intermediate", "event" : "ccdbd64f", "id" : "pb02a", "ring" : 2, "start" : "1:00 PM" }, "pb02b" : { "description" : "Heavy Intermediate", "event" : "ccdbd64f", "id" : "pb02b", "ring" : 1, "start" : "1:08 PM" }, "pb03a" : { "description" : "Fin Advanced", "event" : "ccdbd64f", "id" : "pb03a", "ring" : 2, "start" : "1:08 PM" }, "pb03b" : { "description" : "Light Advanced", "event" : "ccdbd64f", "id" : "pb03b", "ring" : 1, "start" : "1:20 PM" }, "pb03c" : { "description" : "Middle Advanced", "event" : "ccdbd64f", "id" : "pb03c", "ring" : 2, "start" : "1:20 PM" }, "pb03d" : { "description" : "Heavy Advanced", "event" : "ccdbd64f", "id" : "pb03d", "ring" : 2, "start" : "1:28 PM" }, "pp01a" : { "description" : "8yo Beginner", "event" : "7b52936b", "id" : "pp01a", "ring" : 1, "start" : "10:30 AM" }, "pp01b" : { "description" : "9yo Beginner", "event" : "7b52936b", "id" : "pp01b", "ring" : 2, "start" : "10:30 AM" }, "pp02a" : { "description" : "9yo Female Intermediate", "event" : "7b52936b", "id" : "pp02a", "ring" : 1, "start" : "10:34 AM" }, "pp02b" : { "description" : "8-11 Male Intermediate", "event" : "7b52936b", "id" : "pp02b", "ring" : 2, "start" : "10:34 AM" }, "pp03a" : { "description" : "10-11 Advanced", "event" : "7b52936b", "id" : "pp03a", "ring" : 1, "start" : "10:38 AM" }, "pp03b" : { "description" : "12-14 Advanced", "event" : "7b52936b", "id" : "pp03b", "ring" : 2, "start" : "10:38 AM" }, "pp03c" : { "description" : "15-17 Advanced", "event" : "7b52936b", "id" : "pp03c", "ring" : 1, "start" : "10:46 AM" }, "pp04" : { "description" : "Under 50 Advanced", "event" : "7b52936b", "id" : "pp04", "ring" : 1, "start" : "10:50 AM" }, "sb01a" : { "description" : "Speed Breaking Intermediate", "event" : "e3b92e3e", "id" : "sb01a", "ring" : 1, "start" : "1:00 PM" }, "sb01b" : { "description" : "Speed Breaking Advanced", "event" : "e3b92e3e", "id" : "sb01b", "ring" : 2, "start" : "1:00 PM" }, "sp01" : { "description" : "8-11 Male Intermediate [Exhibition NHC]", "event" : "b6ccd47d", "id" : "sp01", "ring" : 1, "start" : "2:30 PM" }, "sp02" : { "description" : "10-14 Mixed Intermediate [Exhibition NHC]", "event" : "b6ccd47d", "id" : "sp02", "ring" : 2, "start" : "2:30 PM" }, "sp03" : { "description" : "12-17 Male Advanced [Exhibition JSR]", "event" : "b6ccd47d", "id" : "sp03", "ring" : 1, "start" : "2:34 PM" }, "sp04" : { "description" : "12-17 Male Black [Exhibition JSR]", "event" : "b6ccd47d", "id" : "sp04", "ring" : 2, "start" : "2:34 PM" }, "tp01a" : { "description" : "6-7 Female Beginner", "event" : "9a9fad90", "id" : "tp01a", "ring" : 1, "start" : "11:00 AM" }, "tp01b" : { "description" : "8-9 Male Beginner", "event" : "9a9fad90", "id" : "tp01b", "ring" : 2, "start" : "11:00 AM" }, "tp01c" : { "description" : "8-9 Female Beginner [Group C]", "event" : "9a9fad90", "id" : "tp01c", "ring" : 1, "start" : "11:04 AM" }, "tp01d" : { "description" : "8-9 Female Beginner [Group D]", "event" : "9a9fad90", "id" : "tp01d", "ring" : 2, "start" : "11:08 AM" }, "tp01e" : { "description" : "10-11 Beginner", "event" : "9a9fad90", "id" : "tp01e", "ring" : 1, "start" : "11:12 AM" }, "tp01f" : { "description" : "12-14 Beginner", "event" : "9a9fad90", "id" : "tp01f", "ring" : 2, "start" : "11:12 AM" }, "tp02a" : { "description" : "6-9 Intermediate", "event" : "9a9fad90", "id" : "tp02a", "ring" : 1, "start" : "11:16 AM" }, "tp02b" : { "description" : "10-11 Male Intermediate", "event" : "9a9fad90", "id" : "tp02b", "ring" : 2, "start" : "11:16 AM" }, "tp02c" : { "description" : "10-11 Female Intermediate", "event" : "9a9fad90", "id" : "tp02c", "ring" : 2, "start" : "11:20 AM" }, "tp02d" : { "description" : "15-17 Intermediate", "event" : "9a9fad90", "id" : "tp02d", "ring" : 1, "start" : "11:24 AM" }, "tp03a" : { "description" : "8-9 Male Advanced", "event" : "9a9fad90", "id" : "tp03a", "ring" : 2, "start" : "11:24 AM" }, "tp03b" : { "description" : "10-14 Female Advanced", "event" : "9a9fad90", "id" : "tp03b", "ring" : 1, "start" : "11:28 AM" }, "tp03c" : { "description" : "10-14 Male Advanced", "event" : "9a9fad90", "id" : "tp03c", "ring" : 2, "start" : "11:28 AM" }, "tp03d" : { "description" : "12-17 Male Advanced", "event" : "9a9fad90", "id" : "tp03d", "ring" : 1, "start" : "11:36 AM" }, "tp04" : { "description" : "Under 40 Intermediate", "event" : "9a9fad90", "id" : "tp04", "ring" : 2, "start" : "11:40 AM" }, "ws01a" : { "description" : "12-14 Weapons Beginner-Intermediate", "event" : "d321a3dd", "id" : "ws01a", "ring" : 1, "start" : "3:00 PM" }, "ws01b" : { "description" : "Under 40 Black", "event" : "d321a3dd", "id" : "ws01b", "ring" : 2, "start" : "3:00 PM" } }, "events" : { "7b52936b" : { "divisions" : [ "pp01a", "pp01b", "pp02a", "pp02b", "pp03a", "pp03b", "pp03c", "pp04" ], "method" : "single elimination", "name" : "Palgwe Traditional Forms", "start" : "10:30 AM" }, "9a9fad90" : { "divisions" : [ "tp01a", "tp01b", "tp01c", "tp01d", "tp01e", "tp01f", "tp02a", "tp02b", "tp02c", "tp02d", "tp03a", "tp03b", "tp03c", "tp03d", "tp04" ], "method" : "single elimination", "name" : "Taegeuk Traditional Forms", "start" : "11:00 AM" }, "b6ccd47d" : { "divisions" : [ "sp01", "sp02", "sp03", "sp04" ], "method" : "single elimination", "name" : "Sparring", "start" : "2:30 PM" }, "b7aa4a12" : { "divisions" : [ "oc01a", "oc01b", "oc02a", "oc02b", "oc03", "oc04", "oc05a", "oc05b" ], "method" : "cutoff", "name" : "Obstacle Course", "start" : "9:00 AM" }, "ccdbd64f" : { "divisions" : [ "pb01", "pb02a", "pb02b", "pb03a", "pb03b", "pb03c", "pb03d" ], "method" : "cutoff", "name" : "Power Breaking", "start" : "1:00 PM" }, "d321a3dd" : { "divisions" : [ "ws01a", "ws01b" ], "method" : "single elimination", "name" : "Weapons Sparring", "start" : "3:00 PM" }, "dc19a65e" : { "divisions" : [ "kp01a", "kp01b", "kp01c", "kp01d", "kp01e", "kp01f" ], "method" : "single elimination", "name" : "Kibon Basic Forms", "start" : "10:00 AM" }, "e3b92e3e" : { "divisions" : [ "sb01a", "sb01b" ], "method" : "cutoff", "name" : "Speed Breaking", "start" : "1:00 PM" } } };
var registration = undefined;
var clock        = undefined;

$(() => {
	if( clock ) { clearInterval( clock ); }
	// clock = setInterval(() => { refresh.checkin( update ); }, 30000 ); // Refresh every 30 seconds
	setTimeout(() => { refresh.checkin( update ); }, 100 ); // MW For development only
});

var divView = $(`<?php include( 'div-view.php' )?>`);

var refresh = {
	checkin: ( update ) => {
		let registration  = new Registration( update.registration );
		let today         = moment().format( 'MMM D, YYYY' );
		let events        = registration.events;
		let now           = moment( `${today} 11:12 AM` );
		let stagings      = [];
		let announcements = [ 
			{ num: 1, start: now.clone().add( 30, 'minutes' ), stop: now.clone().add( 35, 'minutes' )}, 
			{ num: 2, start: now.clone().add( 15, 'minutes' ), stop: now.clone().add( 20, 'minutes' )}, 
			{ num: 3, start: now.clone().add( 5, 'minutes' ),  stop: now.clone().add( 10, 'minutes' )}
		];

		$( '#clock' ).html( now.format( 'h:mm A' ));

		// ===== ANNOUNCER
		for( let announcement of announcements ) {
			events.forEach( ev => {
				let divisions = ev.divisions;
				divisions.forEach( div => {
					if( ! div.start.isSameOrAfter( announcement.start )) { return; }
					if( ! div.start.isBefore( announcement.stop ))       { return; }
					announcer.call( div, announcement.num ); 
					// Mark the division as called; check this to avoid repeated callings
				});
			});
		}

		// ===== STAGING
		events.forEach( ev => {
			let divisions = ev.divisions;
			divisions.forEach( div => {
				let delta = div.start.diff( now, 'minutes' );
				if( delta < 0  )  { return; } // Ignore divisions that should have already been sent out
				if( delta > 30 )  { return; } // Ignore divisions that are too far into the future

				if( delta <= 5  ) { stagings.push({ div: div, deadline: delta, priority: 0 }); return; }
				if( delta <= 15 ) { stagings.push({ div: div, deadline: delta, priority: 1 }); return; }
				if( delta <= 30 ) { stagings.push({ div: div, deadline: delta, priority: 2 }); return; }
			});
		});


		// ===== DIVISION VIEW
		stagings = stagings.sort(( a, b ) => a.deadline - b.deadline );
		$( '#divisions-view' ).empty();
		let width  = 4;
		let height = Math.ceil( stagings.length / width );
		for( let y = 0; y < height; y++ ) {
			let row = html.tr.clone();
			for( let x = 0; x < width; x++ ) {
				let i = y * 4 + x;
				if( i >= stagings.length ) { continue; }
				let staging  = stagings[ i ];
				let div      = staging.div;
				let bgcolor  = [ 'danger', 'warning', 'success' ][ staging.priority ];
				let view     = divView.clone();
				let delta    = moment.duration( div.start.diff( now ));
				let athletes = div.athletes;
				let ready    = athletes.filter( a => a.hasCheckedIn( div )).sort(( a, b ) => a.lastName.localeCompare( b.lastName ));
				let pending  = athletes.filter( a => ! a.hasCheckedIn( div )).sort(( a, b ) => a.lastName.localeCompare( b.lastName ));
				view.find( '.division-view' )     .addClass( `bg-${bgcolor}` );
				view.find( '.division-summary' )  .html( `<span class="divid">${div.id.toUpperCase()}</span>&nbsp;&nbsp;<span class="description">${div.description}</span>` );
				view.find( '.division-start' )    .html( `${div.start.format( 'h:mm A' )}<br><span class="remaining">${delta.humanize()}</span>` );
				view.find( '.athletes .ready' )   .html( ready.length   > 0 ? '<b>Checked-in:</b><br><div class="athlete-list">'  + ready.map( a => a.name ).join( ', ' ) + "</div>" : '' );
				view.find( '.athletes .pending' ) .html( pending.length > 0 ? '<b>Waiting for:</b><br><div class="athlete-list">' + pending.map( a => a.name ).join( ', ' ) + "</div>" : '' );
				row.append( view );

			}
			$( '#divisions-view' ).append( row );
		}
		
		// ===== ATHLETE VIEW
		// Collate the athletes and group their divisions for each athlete
		let athletes = {};
		stagings.forEach( staging => {
			staging.div.athletes.forEach( athlete => {
				let id = athlete.id;
				if( athletes[ id ]) { athletes[ id ].divisions.push({ priority: staging.priority, id: staging.div.id }); } 
				else                { athletes[ id ] = { athlete: athlete, divisions: [ { priority: staging.priority, id: staging.div.id } ]}; }
			});
		});
		$( '#athletes-view' ).empty();
		let checkins = Object.values( athletes ).sort(( a, b ) => a.athlete.lastName.localeCompare( b.athlete.lastName || a.name.localeCompare( b.name )));

		height = Math.ceil( checkins.length / width );

		let row = html.tr.clone();
		for( let x = 0; x < width; x++ ) {
			let col  = html.td.clone();
			let ul   = html.ul.clone().addClass( 'list-group' );
			let list = checkins.splice( 0, height - 1 );

			list.forEach( checkin => {
				let li      = html.li.clone().addClass( 'list-group-item' );
				let bg      = html.div.clone().addClass( 'pull-right' );
				let athlete = checkin.athlete;

				checkin.divisions.forEach( division => {
					let bgcolor = [ 'danger', 'warning', 'success' ][ division.priority ];
					let button  = html.button.clone().addClass( `btn-xs btn-${bgcolor}` ).html( division.id.toUpperCase());
					button.off( 'click' ).click(() => {
						athlete.checkin( division );
						refresh.checkin( update ); // MW This gets called when updated; remove this line when websockets work
					});
					if( ! athlete.hasCheckedIn( division )) { bg.append( button ); }
				});
				if( (bg.children()).length > 0 ) { 
					li.append( athlete.name, bg );
					ul.append( li );
				}
			});
			col.append( ul );
			row.append( col );
		}
		$( '#athletes-view' ).append( row );
	}
}

</script>
