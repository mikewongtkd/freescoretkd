<div class="pt-page pt-page-1 page-checkin">
	<div class="page-header">
		<div class="page-header-content">Athlete Check-in</div>
	</div>
	<div class="container" id="checkin-view">
		<div role="navigation">
			<ul class="nav nav-pills">
				<li class="active"><a data-toggle="tab" href="#athletes-registered">Athletes Registered</a></li>
				<li><a data-toggle="tab" href="#athletes-present">Athletes Present</a></li>
				<li><a data-toggle="tab" href="#athletes-absent">Absent Athletes</a></li>
				<li><a data-toggle="tab" href="#divisions-in-staging">Staging Progress</a></li>
				<li><a data-toggle="tab" href="#divisions-at-rings">Competition Progress</a></li>
			</ul>
		</div>
		<div class="tab-content">
			<div id="athletes-registered" class="tab-pane fade in active">
				<form role="form">
					<div class="form-group">
						<input id="search-registered" class="form-control" type="search" placeholder="Search..." />
					</div>
					<div class="btn-group btn-group-justified" role=group>
					</div>
					<div class="list-group">
					</div>
				</form>
			</div>
			<div id="athletes-present" class="tab-pane fade">
				<form role="form">
					<div class="form-group">
						<input id="search-present" class="form-control" type="search" placeholder="Search..." />
					</div>
					<div class="btn-group btn-group-justified" role=group>
					</div>
					<div class="list-group">
					</div>
				</form>
			</div>
			<div id="divisions-in-staging" class="tab-pane fade">
				<div class="btn-group btn-group-justified" role=group>
				</div>
				<div class="thumbnails">
				</div>
			</div>
			<div id="divisions-at-rings" class="tab-pane fade">
				<div class="btn-group btn-group-justified" role=group>
				</div>
				<div class="thumbnails">
				</div>
			</div>
		</div>
	</div>
</div>
<script>
var registration = { "athletes" : { "03b3ed8d" : { "age" : "10", "belt" : "Purple Belt", "events" : [ "pb02a", "tp02b" ], "first_name" : "Rishay", "gender" : "Male", "last_name" : "RAM", "name" : "Rishay RAM", "weight" : "40.1" }, "0bd64d1a" : { "age" : "14", "belt" : "Black Belt", "events" : [ "pr01", "wc03" ], "first_name" : "Aditi", "gender" : "Female", "last_name" : "PARASURAM", "name" : "Aditi PARASURAM", "weight" : "0" }, "0d3b1ec1" : { "age" : "36", "belt" : "Black Belt", "events" : [ "ws01b" ], "first_name" : "Juan", "gender" : "Male", "last_name" : "LANDIN", "name" : "Juan LANDIN", "weight" : "72.7" }, "0f4c5f82" : { "age" : "9", "belt" : "Blue Belt with Black Stripe", "events" : [ "pb02b" ], "first_name" : "Laura", "gender" : "Female", "last_name" : "PEREZ", "name" : "Laura PEREZ", "weight" : "44.5" }, "12ea0f84" : { "age" : "14", "belt" : "Yellow Belt with Orange Stripe", "events" : [ "tp01f" ], "first_name" : "Griffin", "gender" : "Male", "last_name" : "BUI", "name" : "Griffin BUI", "weight" : "0" }, "1773ebe4" : { "age" : "16", "belt" : "Red Belt", "events" : [ "pb03b", "tp03d" ], "first_name" : "Steven", "gender" : "Male", "last_name" : "BHIRDO", "name" : "Steven BHIRDO", "weight" : "60.5" }, "1c46928d" : { "age" : "11", "belt" : "Black Belt", "events" : [ "wc02" ], "first_name" : "Andrew", "gender" : "Male", "last_name" : "KWOK", "name" : "Andrew KWOK", "weight" : "0" }, "1cbaf36d" : { "age" : "11", "belt" : "Black Belt", "events" : [ "wc01" ], "first_name" : "Gabriella", "gender" : "Female", "last_name" : "WONG", "name" : "Gabriella WONG", "weight" : "20.5" }, "1da1223c" : { "age" : "7", "belt" : "Green Belt", "events" : [ "tp02a" ], "first_name" : "Kirik", "gender" : "Male", "last_name" : "ALTEKAR", "name" : "Kirik ALTEKAR", "weight" : "0" }, "2422a6e0" : { "age" : "6", "belt" : "White Belt with Yellow Stripe", "events" : [ "kp01a" ], "first_name" : "Ria", "gender" : "Female", "last_name" : "RAM", "name" : "Ria RAM", "weight" : "0" }, "25ea873c" : { "age" : "11", "belt" : "Red Belt", "events" : [ "oc05b", "pp03a", "tp03c" ], "first_name" : "Justin", "gender" : "Male", "last_name" : "HUNG", "name" : "Justin HUNG", "weight" : "24.1" }, "2f8535d8" : { "age" : "13", "belt" : "Red Belt with Black Stripe", "events" : [ "pb03c", "tp03c" ], "first_name" : "Ittai", "gender" : "Male", "last_name" : "LUBITCH", "name" : "Ittai LUBITCH", "weight" : "41.4" }, "2fbf169d" : { "age" : "9", "belt" : "White Belt with Purple Stripe", "events" : [ "kp01e", "oc04" ], "first_name" : "Sradha", "gender" : "Female", "last_name" : "PRADEEP", "name" : "Sradha PRADEEP", "weight" : "26.4" }, "3044eb2a" : { "age" : "17", "belt" : "Red Belt with Black Stripe", "events" : [ "pb03a" ], "first_name" : "Parth", "gender" : "Male", "last_name" : "SHROTRI", "name" : "Parth SHROTRI", "weight" : "86.4" }, "311ad72c" : { "age" : "9", "belt" : "Orange Belt", "events" : [ "tp01d" ], "first_name" : "Shreya", "gender" : "Female", "last_name" : "SUJIT", "name" : "Shreya SUJIT", "weight" : "21.8" }, "318eaf21" : { "age" : "13", "belt" : "Red Belt with Black Stripe", "events" : [ "pp03b" ], "first_name" : "Ava", "gender" : "Female", "last_name" : "KWOK", "name" : "Ava KWOK", "weight" : "0" }, "31b97885" : { "age" : "49", "belt" : "Red Belt", "events" : [ "pp04" ], "first_name" : "Philip", "gender" : "Male", "last_name" : "WONG", "name" : "Philip WONG", "weight" : "70.5" }, "3ac7a356" : { "age" : "9", "belt" : "White Belt with Yellow Stripe", "events" : [ "kp01e", "oc04" ], "first_name" : "Reuben", "gender" : "Male", "last_name" : "KURZER", "name" : "Reuben KURZER", "weight" : "27.7" }, "3c47cd5b" : { "age" : "15", "belt" : "Black Belt", "events" : [ "wc05" ], "first_name" : "Arjun", "gender" : "Male", "last_name" : "KRISHNAN", "name" : "Arjun KRISHNAN", "weight" : "63.6" }, "3c820e77" : { "age" : "10", "belt" : "Purple Belt", "events" : [ "oc05b", "pb02a", "pp02b" ], "first_name" : "Benjamin", "gender" : "Male", "last_name" : "LECY-CHONG", "name" : "Benjamin LECY-CHONG", "weight" : "21.8" }, "40867a34" : { "age" : "9", "belt" : "Black Belt", "events" : [ "wc01" ], "first_name" : "Suri", "gender" : "Female", "last_name" : "YAU", "name" : "Suri YAU", "weight" : "0" }, "42016ee5" : { "age" : "12", "belt" : "Red Belt", "events" : [ "pp03b", "tp03c" ], "first_name" : "Aeden", "gender" : "Male", "last_name" : "BERMAN", "name" : "Aeden BERMAN", "weight" : "36.4" }, "43261bd8" : { "age" : "9", "belt" : "Brown Belt", "events" : [ "tp03a" ], "first_name" : "Pranay", "gender" : "Male", "last_name" : "BOKDE", "name" : "Pranay BOKDE", "weight" : "0" }, "44551ad2" : { "age" : "8", "belt" : "Yellow Belt with White Stripe", "events" : [ "oc03", "tp01b" ], "first_name" : "Adam", "gender" : "Male", "last_name" : "LEVY-CHONG", "name" : "Adam LEVY-CHONG", "weight" : "19.1" }, "45bac02a" : { "age" : "8", "belt" : "White Belt with Yellow Stripe", "events" : [ "kp01d" ], "first_name" : "Rannvijay", "gender" : "Male", "last_name" : "SINGH", "name" : "Rannvijay SINGH", "weight" : "0" }, "4849ba61" : { "age" : "11", "belt" : "Red Belt", "events" : [ "pb03c" ], "first_name" : "Daniel", "gender" : "Male", "last_name" : "PEREZ", "name" : "Daniel PEREZ", "weight" : "44.1" }, "48a120c2" : { "age" : "11", "belt" : "Red Belt with Black Stripe", "events" : [ "oc05b", "pb03d", "pp03a" ], "first_name" : "Suraj RAJESH", "gender" : "Male", "last_name" : "KUMAR", "name" : "Suraj RAJESH KUMAR", "weight" : "29.5" }, "49c90e7e" : { "age" : "7", "belt" : "Yellow Belt with White Stripe", "events" : [ "oc02a", "tp01a" ], "first_name" : "Diyaashree", "gender" : "Female", "last_name" : "SENTHILKUMAR", "name" : "Diyaashree SENTHILKUMAR", "weight" : "0" }, "4c3e764f" : { "age" : "12", "belt" : "Red Belt with Black Stripe", "events" : [ "tp03b" ], "first_name" : "Maya", "gender" : "Female", "last_name" : "KRISHNAN", "name" : "Maya KRISHNAN", "weight" : "43.2" }, "4fd8459e" : { "age" : "6", "belt" : "White Belt with Green Stripe", "events" : [ "kp01a", "oc01b" ], "first_name" : "Oren", "gender" : "Male", "last_name" : "SALINAS", "name" : "Oren SALINAS", "weight" : "0" }, "51151389" : { "age" : "5", "belt" : "Yellow Belt with White Stripe", "events" : [ "oc01b" ], "first_name" : "Derek", "gender" : "Male", "last_name" : "ALTEKAR", "name" : "Derek ALTEKAR", "weight" : "0" }, "55927606" : { "age" : "17", "belt" : "Black Belt", "events" : [ "sp04" ], "first_name" : "Sonaal", "gender" : "Male", "last_name" : "JAYAWARDENA", "name" : "Sonaal JAYAWARDENA", "weight" : "61.4" }, "590cd291" : { "age" : "12", "belt" : "Red Belt", "events" : [ "pp03b" ], "first_name" : "Krishna", "gender" : "Male", "last_name" : "ARVIND", "name" : "Krishna ARVIND", "weight" : "36.4" }, "5a3a5b44" : { "age" : "14", "belt" : "Red Belt with Black Stripe", "events" : [ "tp03d" ], "first_name" : "Sarvesh", "gender" : "Male", "last_name" : "AIYAGARI", "name" : "Sarvesh AIYAGARI", "weight" : "0" }, "5c1b41dc" : { "age" : "10", "belt" : "Blue Belt", "events" : [ "tp02c" ], "first_name" : "Siyona", "gender" : "Female", "last_name" : "KHER", "name" : "Siyona KHER", "weight" : "0" }, "5e26a956" : { "age" : "8", "belt" : "Yellow Belt with White Stripe", "events" : [ "kp01d", "tp01b" ], "first_name" : "Dylan", "gender" : "Male", "last_name" : "BERMAN", "name" : "Dylan BERMAN", "weight" : "30.5" }, "5f15251c" : { "age" : "30", "belt" : "Black Belt", "events" : [ "wc06" ], "first_name" : "Misol", "gender" : "Female", "last_name" : "DO", "name" : "Misol DO", "weight" : "47.3" }, "6c138d17" : { "age" : "14", "belt" : "Green Belt", "events" : [ "ws01a" ], "first_name" : "Annecy", "gender" : "Female", "last_name" : "BEGOLE", "name" : "Annecy BEGOLE", "weight" : "40.9" }, "6dfac1a7" : { "age" : "9", "belt" : "Brown Belt", "events" : [ "tp03a" ], "first_name" : "Huancheng (Ronnie)", "gender" : "Male", "last_name" : "WANG", "name" : "Huancheng (Ronnie) WANG", "weight" : "22.3" }, "73592387" : { "age" : "11", "belt" : "Black Belt", "events" : [ "wc01" ], "first_name" : "Kaylee", "gender" : "Female", "last_name" : "YOSHIDA", "name" : "Kaylee YOSHIDA", "weight" : "0" }, "74e2a0a5" : { "age" : "8", "belt" : "White Belt with Orange Stripe", "events" : [ "kp01d" ], "first_name" : "Saanvi", "gender" : "Female", "last_name" : "RATHOD", "name" : "Saanvi RATHOD", "weight" : "26" }, "7507c9eb" : { "age" : "11", "belt" : "White Belt with Yellow Stripe", "events" : [ "kp01f" ], "first_name" : "Hrishi", "gender" : "Male", "last_name" : "VIJAY", "name" : "Hrishi VIJAY", "weight" : "0" }, "754fa4ac" : { "age" : "7", "belt" : "White Belt with Blue Stripe", "events" : [ "kp01b" ], "first_name" : "Gayatri", "gender" : "Female", "last_name" : "UNNIKRISHNAN", "name" : "Gayatri UNNIKRISHNAN", "weight" : "0" }, "78f7e790" : { "age" : "7", "belt" : "White Belt with Yellow Stripe", "events" : [ "kp01c", "oc02b" ], "first_name" : "Ryan", "gender" : "Male", "last_name" : "TRUONG", "name" : "Ryan TRUONG", "weight" : "0" }, "79e25b09" : { "age" : "16", "belt" : "Red Belt with Black Stripe", "events" : [ "pp03c" ], "first_name" : "Kanav", "gender" : "Male", "last_name" : "MITTAL", "name" : "Kanav MITTAL", "weight" : "56.8" }, "7b73fbf8" : { "age" : "15", "belt" : "Green Belt with Black Stripe", "events" : [ "tp02d" ], "first_name" : "Sander", "gender" : "Male", "last_name" : "BOUCHARD", "name" : "Sander BOUCHARD", "weight" : "0" }, "7c996bb8" : { "age" : "7", "belt" : "White Belt", "events" : [ "kp01c", "oc02b" ], "first_name" : "Jordan", "gender" : "Male", "last_name" : "BENAVIDEZ", "name" : "Jordan BENAVIDEZ", "weight" : "21.8" }, "7ca362c4" : { "age" : "11", "belt" : "Green Belt", "events" : [ "pb02b", "sb01a", "sp01", "sp02" ], "first_name" : "Jeremias", "gender" : "Male", "last_name" : "STAUCH", "name" : "Jeremias STAUCH", "weight" : "44.1" }, "7e2725f2" : { "age" : "6", "belt" : "White Belt with Yellow Stripe", "events" : [ "oc01a" ], "first_name" : "Victor", "gender" : "Male", "last_name" : "TORRES-BERNARD", "name" : "Victor TORRES-BERNARD", "weight" : "23.2" }, "8354e666" : { "age" : "12", "belt" : "Yellow Belt with Orange Stripe", "events" : [ "tp01f" ], "first_name" : "Kartik Raj", "gender" : "Male", "last_name" : "SARAVANAN", "name" : "Kartik Raj SARAVANAN", "weight" : "30.9" }, "84876eae" : { "age" : "11", "belt" : "Red Belt with Black Stripe", "events" : [ "oc05a", "pp03a" ], "first_name" : "Kavinaya", "gender" : "Female", "last_name" : "SENTHILKUMAR", "name" : "Kavinaya SENTHILKUMAR", "weight" : "0" }, "856ab38e" : { "age" : "8", "belt" : "Yellow Belt with White Stripe", "events" : [ "oc03", "pp01a", "tp01c" ], "first_name" : "Dhriti", "gender" : "Female", "last_name" : "DEEPAK", "name" : "Dhriti DEEPAK", "weight" : "20.5" }, "8834f4d2" : { "age" : "13", "belt" : "Red Belt", "events" : [ "pp03b", "tp03c" ], "first_name" : "Saqif Ayaan", "gender" : "Male", "last_name" : "SUDHEER", "name" : "Saqif Ayaan SUDHEER", "weight" : "39.5" }, "88f77f01" : { "age" : "9", "belt" : "Yellow Belt with Orange Stripe", "events" : [ "tp01c" ], "first_name" : "Isla", "gender" : "Female", "last_name" : "BUI", "name" : "Isla BUI", "weight" : "0" }, "91cd8672" : { "age" : "9", "belt" : "Blue Belt", "events" : [ "tp02a" ], "first_name" : "Emily", "gender" : "Female", "last_name" : "KWOK", "name" : "Emily KWOK", "weight" : "0" }, "95621bd0" : { "age" : "11", "belt" : "Blue Belt", "events" : [ "tp02c" ], "first_name" : "Kaashvi", "gender" : "Female", "last_name" : "MITTAL", "name" : "Kaashvi MITTAL", "weight" : "0" }, "9db6b537" : { "age" : "15", "belt" : "Black Belt", "events" : [ "wc05" ], "first_name" : "Cleo", "gender" : "Female", "last_name" : "CHEN", "name" : "Cleo CHEN", "weight" : "48.2" }, "a1e336ca" : { "age" : "11", "belt" : "Orange Belt", "events" : [ "pb02b", "tp01e" ], "first_name" : "Samuel", "gender" : "Male", "last_name" : "LI", "name" : "Samuel LI", "weight" : "49.1" }, "a24800f7" : { "age" : "7", "belt" : "White Belt", "events" : [ "oc02a" ], "first_name" : "Phoebe", "gender" : "Female", "last_name" : "CAMP", "name" : "Phoebe CAMP", "weight" : "0" }, "a2a373be" : { "age" : "10", "belt" : "Green Belt", "events" : [ "oc05b", "tp02b" ], "first_name" : "Matthew", "gender" : "Male", "last_name" : "LIM", "name" : "Matthew LIM", "weight" : "0" }, "a63c0a4a" : { "age" : "6", "belt" : "White Belt with Yellow Stripe", "events" : [ "oc01b" ], "first_name" : "Kai", "gender" : "Male", "last_name" : "HUNG", "name" : "Kai HUNG", "weight" : "15.9" }, "a63ee8f3" : { "age" : "11", "belt" : "Green Belt", "events" : [ "sb01a" ], "first_name" : "Allon", "gender" : "Male", "last_name" : "LUBITCH", "name" : "Allon LUBITCH", "weight" : "34.4" }, "a6b75167" : { "age" : "15", "belt" : "Brown Belt", "events" : [ "pb03a", "sb01b", "sp03" ], "first_name" : "Serafin", "gender" : "Male", "last_name" : "STAUCH", "name" : "Serafin STAUCH", "weight" : "74.5" }, "a9622da6" : { "age" : "7", "belt" : "White Belt with Yellow Stripe", "events" : [ "kp01c", "oc02b" ], "first_name" : "Logan", "gender" : "Male", "last_name" : "CASHMAN", "name" : "Logan CASHMAN", "weight" : "0" }, "ac7d84b3" : { "age" : "6", "belt" : "Orange Belt", "events" : [ "oc01a", "tp01a" ], "first_name" : "Lena", "gender" : "Female", "last_name" : "SILBERSTEIN", "name" : "Lena SILBERSTEIN", "weight" : "20.5" }, "b12d04d5" : { "age" : "6", "belt" : "White Belt with Purple Stripe", "events" : [ "kp01a", "oc01a" ], "first_name" : "Jeffrey", "gender" : "Male", "last_name" : "LIM", "name" : "Jeffrey LIM", "weight" : "0" }, "b640f8d6" : { "age" : "9", "belt" : "Blue Belt with Black Stripe", "events" : [ "pp02b", "sp01" ], "first_name" : "Leo", "gender" : "Male", "last_name" : "SILBERSTEIN", "name" : "Leo SILBERSTEIN", "weight" : "24.1" }, "b7c4e0d4" : { "age" : "14", "belt" : "Red Belt with Black Stripe", "events" : [ "pp03b" ], "first_name" : "Max", "gender" : "Male", "last_name" : "WESTER", "name" : "Max WESTER", "weight" : "0" }, "baa45cb3" : { "age" : "7", "belt" : "White Belt with Yellow Stripe", "events" : [ "kp01b", "pb01" ], "first_name" : "Ava", "gender" : "Female", "last_name" : "ESSON", "name" : "Ava ESSON", "weight" : "24.5" }, "be0a308d" : { "age" : "9", "belt" : "Green Belt with Black Stripe", "events" : [ "pp02a" ], "first_name" : "Rayna", "gender" : "Female", "last_name" : "AMBROSE", "name" : "Rayna AMBROSE", "weight" : "0" }, "c0033c82" : { "age" : "9", "belt" : "Yellow Belt with White Stripe", "events" : [ "oc04", "pb01", "pp01b", "tp01c" ], "first_name" : "Kaira", "gender" : "Female", "last_name" : "PRADEEP", "name" : "Kaira PRADEEP", "weight" : "0" }, "c02fe14c" : { "age" : "14", "belt" : "Black Belt", "events" : [ "pb03a", "pr01", "sb01b", "sp03", "sp04", "wc04", "ws01b" ], "first_name" : "Adarsh", "gender" : "Male", "last_name" : "GUPTA", "name" : "Adarsh GUPTA", "weight" : "65.9" }, "c5e8268f" : { "age" : "11", "belt" : "Yellow Belt with Orange Stripe", "events" : [ "oc05a", "tp01e" ], "first_name" : "Sophie", "gender" : "Female", "last_name" : "BUI", "name" : "Sophie BUI", "weight" : "0" }, "c674fa54" : { "age" : "16", "belt" : "Brown Belt", "events" : [ "pb03b", "pp03c" ], "first_name" : "Kasiet", "gender" : "Female", "last_name" : "TEMIRALIEVA", "name" : "Kasiet TEMIRALIEVA", "weight" : "61.4" }, "d02ccbb4" : { "age" : "11", "belt" : "Brown Belt", "events" : [ "tp03b" ], "first_name" : "Skylar", "gender" : "Female", "last_name" : "YAU", "name" : "Skylar YAU", "weight" : "0" }, "d36d96f2" : { "age" : "12", "belt" : "Black Belt", "events" : [ "wc03" ], "first_name" : "Angelina", "gender" : "Female", "last_name" : "CUAN", "name" : "Angelina CUAN", "weight" : "28.2" }, "d4d42d68" : { "age" : "12", "belt" : "Red Belt", "events" : [ "sp02", "tp03b" ], "first_name" : "Samantha", "gender" : "Female", "last_name" : "REGI", "name" : "Samantha REGI", "weight" : "48.2" }, "d8da529c" : { "age" : "9", "belt" : "Orange Belt with Black Stripe", "events" : [ "oc04", "pp01b", "tp01d" ], "first_name" : "Sanya", "gender" : "Female", "last_name" : "CHOUDHARI", "name" : "Sanya CHOUDHARI", "weight" : "31.4" }, "d905362a" : { "age" : "12", "belt" : "Black Belt", "events" : [ "wc04" ], "first_name" : "Ajay", "gender" : "Male", "last_name" : "GOPINATH", "name" : "Ajay GOPINATH", "weight" : "47.7" }, "d9393a8c" : { "age" : "12", "belt" : "Yellow Belt with White Stripe", "events" : [ "ws01a" ], "first_name" : "Julian", "gender" : "Male", "last_name" : "CUDZINOVIC", "name" : "Julian CUDZINOVIC", "weight" : "50.9" }, "e4a350da" : { "age" : "15", "belt" : "Brown Belt with Black Stripe", "events" : [ "tp03d" ], "first_name" : "Anand", "gender" : "Male", "last_name" : "ASHAR", "name" : "Anand ASHAR", "weight" : "48.6" }, "e55b1766" : { "age" : "8", "belt" : "Yellow Belt with Orange Stripe", "events" : [ "oc03", "pp01a", "tp01b" ], "first_name" : "Ilan", "gender" : "Male", "last_name" : "SALINAS", "name" : "Ilan SALINAS", "weight" : "0" }, "e77d7a71" : { "age" : "10", "belt" : "White Belt", "events" : [ "kp01f", "oc05a" ], "first_name" : "Lucy", "gender" : "Female", "last_name" : "CAMP", "name" : "Lucy CAMP", "weight" : "0" }, "e9557c65" : { "age" : "9", "belt" : "Purple Belt", "events" : [ "pp02a" ], "first_name" : "Anamika", "gender" : "Female", "last_name" : "TOMER", "name" : "Anamika TOMER", "weight" : "0" }, "eb257e35" : { "age" : "15", "belt" : "Black Belt", "events" : [ "pb03b", "ws01b" ], "first_name" : "Aiden", "gender" : "Male", "last_name" : "BEGOLE", "name" : "Aiden BEGOLE", "weight" : "60.7" }, "f215db47" : { "age" : "35", "belt" : "Green Belt", "events" : [ "tp04" ], "first_name" : "Justin", "gender" : "Male", "last_name" : "BAUMLI", "name" : "Justin BAUMLI", "weight" : "76.4" }, "f21d56c1" : { "age" : "11", "belt" : "Black Belt", "events" : [ "pb03d", "wc02" ], "first_name" : "Parth", "gender" : "Male", "last_name" : "DHAULAKHANDI", "name" : "Parth DHAULAKHANDI", "weight" : "36.4" }, "f6bb6b2c" : { "age" : "9", "belt" : "Green Belt", "events" : [ "tp02a" ], "first_name" : "Anika", "gender" : "Female", "last_name" : "ATHALE", "name" : "Anika ATHALE", "weight" : "0" }, "f6bdb7e0" : { "age" : "16", "belt" : "Blue Belt", "events" : [ "tp02d" ], "first_name" : "Michelle", "gender" : "Female", "last_name" : "WALLERIUS", "name" : "Michelle WALLERIUS", "weight" : "0" } }, "events" : { "Kibon Basic Forms" : { "divisions" : { "kp01a" : { "athletes" : [ { "checkin" : false, "id" : "b12d04d5" }, { "checkin" : false, "id" : "4fd8459e" }, { "checkin" : false, "id" : "2422a6e0" } ], "description" : "6yo Beginner", "event" : "Kibon Basic Forms", "id" : "kp01a" }, "kp01b" : { "athletes" : [ { "checkin" : false, "id" : "baa45cb3" }, { "checkin" : false, "id" : "754fa4ac" } ], "description" : "7yo Female Beginner", "event" : "Kibon Basic Forms", "id" : "kp01b" }, "kp01c" : { "athletes" : [ { "checkin" : false, "id" : "7c996bb8" }, { "checkin" : false, "id" : "a9622da6" }, { "checkin" : false, "id" : "78f7e790" } ], "description" : "7yo Male Beginner", "event" : "Kibon Basic Forms", "id" : "kp01c" }, "kp01d" : { "athletes" : [ { "checkin" : false, "id" : "5e26a956" }, { "checkin" : false, "id" : "45bac02a" }, { "checkin" : false, "id" : "74e2a0a5" } ], "description" : "8yo Beginner", "event" : "Kibon Basic Forms", "id" : "kp01d" }, "kp01e" : { "athletes" : [ { "checkin" : false, "id" : "3ac7a356" }, { "checkin" : false, "id" : "2fbf169d" } ], "description" : "9yo Beginner", "event" : "Kibon Basic Forms", "id" : "kp01e" }, "kp01f" : { "athletes" : [ { "checkin" : false, "id" : "7507c9eb" }, { "checkin" : false, "id" : "e77d7a71" } ], "description" : "10-11 Beginner", "event" : "Kibon Basic Forms", "id" : "kp01f" } } }, "Obstacle Course" : { "divisions" : { "oc01a" : { "athletes" : [ { "checkin" : false, "id" : "b12d04d5" }, { "checkin" : false, "id" : "ac7d84b3" }, { "checkin" : false, "id" : "7e2725f2" } ], "description" : "5-6 Beginner [Group A]", "event" : "Obstacle Course", "id" : "oc01a" }, "oc01b" : { "athletes" : [ { "checkin" : false, "id" : "51151389" }, { "checkin" : false, "id" : "a63c0a4a" }, { "checkin" : false, "id" : "4fd8459e" } ], "description" : "5-6 Beginner [Group B]", "event" : "Obstacle Course", "id" : "oc01b" }, "oc02a" : { "athletes" : [ { "checkin" : false, "id" : "49c90e7e" }, { "checkin" : false, "id" : "a24800f7" } ], "description" : "7yo Female Beginner", "event" : "Obstacle Course", "id" : "oc02a" }, "oc02b" : { "athletes" : [ { "checkin" : false, "id" : "7c996bb8" }, { "checkin" : false, "id" : "a9622da6" }, { "checkin" : false, "id" : "78f7e790" } ], "description" : "7yo Male Beginner", "event" : "Obstacle Course", "id" : "oc02b" }, "oc03" : { "athletes" : [ { "checkin" : false, "id" : "44551ad2" }, { "checkin" : false, "id" : "856ab38e" }, { "checkin" : false, "id" : "e55b1766" } ], "description" : "8yo Beginner", "event" : "Obstacle Course", "id" : "oc03" }, "oc04" : { "athletes" : [ { "checkin" : false, "id" : "c0033c82" }, { "checkin" : false, "id" : "3ac7a356" }, { "checkin" : false, "id" : "d8da529c" }, { "checkin" : false, "id" : "2fbf169d" } ], "description" : "9yo Beginner", "event" : "Obstacle Course", "id" : "oc04" }, "oc05a" : { "athletes" : [ { "checkin" : false, "id" : "84876eae" }, { "checkin" : false, "id" : "e77d7a71" }, { "checkin" : false, "id" : "c5e8268f" } ], "description" : "10-11 Female", "event" : "Obstacle Course", "id" : "oc05a" }, "oc05b" : { "athletes" : [ { "checkin" : false, "id" : "3c820e77" }, { "checkin" : false, "id" : "25ea873c" }, { "checkin" : false, "id" : "a2a373be" }, { "checkin" : false, "id" : "48a120c2" } ], "description" : "10-11 Male", "event" : "Obstacle Course", "id" : "oc05b" } } }, "Palgwe Traditional Forms" : { "divisions" : { "pp01a" : { "athletes" : [ { "checkin" : false, "id" : "856ab38e" }, { "checkin" : false, "id" : "e55b1766" } ], "description" : "8yo Beginner", "event" : "Palgwe Traditional Forms", "id" : "pp01a" }, "pp01b" : { "athletes" : [ { "checkin" : false, "id" : "c0033c82" }, { "checkin" : false, "id" : "d8da529c" } ], "description" : "9yo Beginner", "event" : "Palgwe Traditional Forms", "id" : "pp01b" }, "pp02a" : { "athletes" : [ { "checkin" : false, "id" : "e9557c65" }, { "checkin" : false, "id" : "be0a308d" } ], "description" : "9yo Female Intermediate", "event" : "Palgwe Traditional Forms", "id" : "pp02a" }, "pp02b" : { "athletes" : [ { "checkin" : false, "id" : "3c820e77" }, { "checkin" : false, "id" : "b640f8d6" } ], "description" : "8-11 Male Intermediate", "event" : "Palgwe Traditional Forms", "id" : "pp02b" }, "pp03a" : { "athletes" : [ { "checkin" : false, "id" : "25ea873c" }, { "checkin" : false, "id" : "84876eae" }, { "checkin" : false, "id" : "48a120c2" } ], "description" : "10-11 Advanced", "event" : "Palgwe Traditional Forms", "id" : "pp03a" }, "pp03b" : { "athletes" : [ { "checkin" : false, "id" : "42016ee5" }, { "checkin" : false, "id" : "318eaf21" }, { "checkin" : false, "id" : "590cd291" }, { "checkin" : false, "id" : "b7c4e0d4" }, { "checkin" : false, "id" : "8834f4d2" } ], "description" : "12-14 Advanced", "event" : "Palgwe Traditional Forms", "id" : "pp03b" }, "pp03c" : { "athletes" : [ { "checkin" : false, "id" : "79e25b09" }, { "checkin" : false, "id" : "c674fa54" } ], "description" : "15-17 Advanced", "event" : "Palgwe Traditional Forms", "id" : "pp03c" }, "pp04" : { "athletes" : [ { "checkin" : false, "id" : "31b97885" } ], "description" : "Under 50 Advanced", "event" : "Palgwe Traditional Forms", "id" : "pp04" } } }, "Power Breaking" : { "divisions" : { "pb01" : { "athletes" : [ { "checkin" : false, "id" : "baa45cb3" }, { "checkin" : false, "id" : "c0033c82" } ], "description" : "Beginner", "event" : "Power Breaking", "id" : "pb01" }, "pb02a" : { "athletes" : [ { "checkin" : false, "id" : "3c820e77" }, { "checkin" : false, "id" : "03b3ed8d" } ], "description" : "Light Intermediate", "event" : "Power Breaking", "id" : "pb02a" }, "pb02b" : { "athletes" : [ { "checkin" : false, "id" : "7ca362c4" }, { "checkin" : false, "id" : "0f4c5f82" }, { "checkin" : false, "id" : "a1e336ca" } ], "description" : "Heavy Intermediate", "event" : "Power Breaking", "id" : "pb02b" }, "pb03a" : { "athletes" : [ { "checkin" : false, "id" : "c02fe14c" }, { "checkin" : false, "id" : "3044eb2a" }, { "checkin" : false, "id" : "a6b75167" } ], "description" : "Fin Advanced", "event" : "Power Breaking", "id" : "pb03a" }, "pb03b" : { "athletes" : [ { "checkin" : false, "id" : "eb257e35" }, { "checkin" : false, "id" : "c674fa54" }, { "checkin" : false, "id" : "1773ebe4" } ], "description" : "Light Advanced", "event" : "Power Breaking", "id" : "pb03b" }, "pb03c" : { "athletes" : [ { "checkin" : false, "id" : "4849ba61" }, { "checkin" : false, "id" : "2f8535d8" } ], "description" : "Middle Advanced", "event" : "Power Breaking", "id" : "pb03c" }, "pb03d" : { "athletes" : [ { "checkin" : false, "id" : "f21d56c1" }, { "checkin" : false, "id" : "48a120c2" } ], "description" : "Heavy Advanced", "event" : "Power Breaking", "id" : "pb03d" } } }, "Sparring" : { "divisions" : { "sp01" : { "athletes" : [ { "checkin" : false, "id" : "7ca362c4" }, { "checkin" : false, "id" : "b640f8d6" } ], "description" : "8-11 Male Intermediate [Exhibition NHC]", "event" : "Sparring", "id" : "sp01" }, "sp02" : { "athletes" : [ { "checkin" : false, "id" : "7ca362c4" }, { "checkin" : false, "id" : "d4d42d68" } ], "description" : "10-14 Mixed Intermediate [Exhibition NHC]", "event" : "Sparring", "id" : "sp02" }, "sp03" : { "athletes" : [ { "checkin" : false, "id" : "c02fe14c" }, { "checkin" : false, "id" : "a6b75167" } ], "description" : "12-17 Male Advanced [Exhibition JSR]", "event" : "Sparring", "id" : "sp03" }, "sp04" : { "athletes" : [ { "checkin" : false, "id" : "c02fe14c" }, { "checkin" : false, "id" : "55927606" } ], "description" : "12-17 Male Black [Exhibition JSR]", "event" : "Sparring", "id" : "sp04" } } }, "Speed Breaking" : { "divisions" : { "sb01a" : { "athletes" : [ { "checkin" : false, "id" : "a63ee8f3" }, { "checkin" : false, "id" : "7ca362c4" } ], "description" : "Speed Breaking Intermediate", "event" : "Speed Breaking", "id" : "sb01a" }, "sb01b" : { "athletes" : [ { "checkin" : false, "id" : "c02fe14c" }, { "checkin" : false, "id" : "a6b75167" } ], "description" : "Speed Breaking Advanced", "event" : "Speed Breaking", "id" : "sb01b" } } }, "Taegeuk Traditional Forms" : { "divisions" : { "tp01a" : { "athletes" : [ { "checkin" : false, "id" : "49c90e7e" }, { "checkin" : false, "id" : "ac7d84b3" } ], "description" : "6-7 Female Beginner", "event" : "Taegeuk Traditional Forms", "id" : "tp01a" }, "tp01b" : { "athletes" : [ { "checkin" : false, "id" : "44551ad2" }, { "checkin" : false, "id" : "5e26a956" }, { "checkin" : false, "id" : "e55b1766" } ], "description" : "8-9 Male Beginner", "event" : "Taegeuk Traditional Forms", "id" : "tp01b" }, "tp01c" : { "athletes" : [ { "checkin" : false, "id" : "856ab38e" }, { "checkin" : false, "id" : "88f77f01" }, { "checkin" : false, "id" : "c0033c82" } ], "description" : "8-9 Female Beginner [Group C]", "event" : "Taegeuk Traditional Forms", "id" : "tp01c" }, "tp01d" : { "athletes" : [ { "checkin" : false, "id" : "d8da529c" }, { "checkin" : false, "id" : "311ad72c" } ], "description" : "8-9 Female Beginner [Group D]", "event" : "Taegeuk Traditional Forms", "id" : "tp01d" }, "tp01e" : { "athletes" : [ { "checkin" : false, "id" : "a1e336ca" }, { "checkin" : false, "id" : "c5e8268f" } ], "description" : "10-11 Beginner", "event" : "Taegeuk Traditional Forms", "id" : "tp01e" }, "tp01f" : { "athletes" : [ { "checkin" : false, "id" : "12ea0f84" }, { "checkin" : false, "id" : "8354e666" } ], "description" : "12-14 Beginner", "event" : "Taegeuk Traditional Forms", "id" : "tp01f" }, "tp02a" : { "athletes" : [ { "checkin" : false, "id" : "f6bb6b2c" }, { "checkin" : false, "id" : "91cd8672" }, { "checkin" : false, "id" : "1da1223c" } ], "description" : "6-9 Intermediate", "event" : "Taegeuk Traditional Forms", "id" : "tp02a" }, "tp02b" : { "athletes" : [ { "checkin" : false, "id" : "a2a373be" }, { "checkin" : false, "id" : "03b3ed8d" } ], "description" : "10-11 Male Intermediate", "event" : "Taegeuk Traditional Forms", "id" : "tp02b" }, "tp02c" : { "athletes" : [ { "checkin" : false, "id" : "95621bd0" }, { "checkin" : false, "id" : "5c1b41dc" } ], "description" : "10-11 Female Intermediate", "event" : "Taegeuk Traditional Forms", "id" : "tp02c" }, "tp02d" : { "athletes" : [ { "checkin" : false, "id" : "f6bdb7e0" }, { "checkin" : false, "id" : "7b73fbf8" } ], "description" : "15-17 Intermediate", "event" : "Taegeuk Traditional Forms", "id" : "tp02d" }, "tp03a" : { "athletes" : [ { "checkin" : false, "id" : "6dfac1a7" }, { "checkin" : false, "id" : "43261bd8" } ], "description" : "8-9 Male Advanced", "event" : "Taegeuk Traditional Forms", "id" : "tp03a" }, "tp03b" : { "athletes" : [ { "checkin" : false, "id" : "4c3e764f" }, { "checkin" : false, "id" : "d4d42d68" }, { "checkin" : false, "id" : "d02ccbb4" } ], "description" : "10-14 Female Advanced", "event" : "Taegeuk Traditional Forms", "id" : "tp03b" }, "tp03c" : { "athletes" : [ { "checkin" : false, "id" : "42016ee5" }, { "checkin" : false, "id" : "2f8535d8" }, { "checkin" : false, "id" : "25ea873c" }, { "checkin" : false, "id" : "8834f4d2" } ], "description" : "10-14 Male Advanced", "event" : "Taegeuk Traditional Forms", "id" : "tp03c" }, "tp03d" : { "athletes" : [ { "checkin" : false, "id" : "e4a350da" }, { "checkin" : false, "id" : "5a3a5b44" }, { "checkin" : false, "id" : "1773ebe4" } ], "description" : "12-17 Male Advanced", "event" : "Taegeuk Traditional Forms", "id" : "tp03d" }, "tp04" : { "athletes" : [ { "checkin" : false, "id" : "f215db47" } ], "description" : "Under 40 Intermediate", "event" : "Taegeuk Traditional Forms", "id" : "tp04" } } }, "Weapons Sparring" : { "divisions" : { "ws01a" : { "athletes" : [ { "checkin" : false, "id" : "6c138d17" }, { "checkin" : false, "id" : "d9393a8c" } ], "description" : "12-14 Weapons Beginner-Intermediate", "event" : "Weapons Sparring", "id" : "ws01a" }, "ws01b" : { "athletes" : [ { "checkin" : false, "id" : "c02fe14c" }, { "checkin" : false, "id" : "eb257e35" }, { "checkin" : false, "id" : "0d3b1ec1" } ], "description" : "Under 40 Black", "event" : "Weapons Sparring", "id" : "ws01b" } } }, "World Class Individual" : { "divisions" : { "wc01" : { "athletes" : [ { "checkin" : false, "id" : "1cbaf36d" }, { "checkin" : false, "id" : "73592387" }, { "checkin" : false, "id" : "40867a34" } ], "description" : "Youth Female Individuals", "event" : "World Class Individual", "id" : "wc01" }, "wc02" : { "athletes" : [ { "checkin" : false, "id" : "1c46928d" }, { "checkin" : false, "id" : "f21d56c1" } ], "description" : "Youth Male Individuals", "event" : "World Class Individual", "id" : "wc02" }, "wc03" : { "athletes" : [ { "checkin" : false, "id" : "0bd64d1a" }, { "checkin" : false, "id" : "d36d96f2" } ], "description" : "Cadet Female Individuals", "event" : "World Class Individual", "id" : "wc03" }, "wc04" : { "athletes" : [ { "checkin" : false, "id" : "c02fe14c" }, { "checkin" : false, "id" : "d905362a" } ], "description" : "Cadet Male Individuals", "event" : "World Class Individual", "id" : "wc04" }, "wc05" : { "athletes" : [ { "checkin" : false, "id" : "3c47cd5b" }, { "checkin" : false, "id" : "9db6b537" } ], "description" : "Junior Mixed Individuals", "event" : "World Class Individual", "id" : "wc05" }, "wc06" : { "athletes" : [ { "checkin" : false, "id" : "5f15251c" } ], "description" : "Under 30 Individuals", "event" : "World Class Individual", "id" : "wc06" } } }, "World Class Pairs or Teams" : { "divisions" : { "pr01" : { "athletes" : [ { "checkin" : false, "id" : "c02fe14c" }, { "checkin" : false, "id" : "0bd64d1a" } ], "description" : "Junior Pairs", "event" : "World Class Pairs or Teams", "id" : "pr01" } } } } };
registration.event = {};
registration.event.order = Object.keys( registration.events ).sort();
$(() => {
	refresh.checkin( registration );
});

refresh.checkin = ( registration ) => {

	// ==== SORT AND REDUCE FUNCTIONS
	var sort_by_last_name = ( a, b ) => {
		a = registration.athletes[ a ];
		b = registration.athletes[ b ];
		return a.last_name.localeCompare( b.last_name ) || a.first_name.localeCompare( b.first_name );
	};

	var sort_by_first_name = ( a, b ) => {
		a = registration.athletes[ a ];
		b = registration.athletes[ b ];
		return a.first_name.localeCompare( b.first_name ) || a.last_name.localeCompare( b.last_name );
	};

	registration.divisions = {};
	Object.keys( registration.events ).forEach(( ev ) => {
		Object.keys( registration.events[ ev ] ).forEach(( divid ) => {
			registration.divisions[ divid ] = ev;
		});
	});

	$( '#athletes-registered .btn-group,.list-group' ).empty();
	$( '#athletes-present .btn-group,.list-group' ).empty();
	$( '#athletes-absent .btn-group,.list-group' ).empty();

	$( '#athletes-registered .list-group' ).btsListFilter( '#search-registered', { initial: false, resetOnBlur: false });
	$( '#athletes-present .list-group' )   .btsListFilter( '#search-present',  { initial: false, resetOnBlur: false });

	Object.keys( registration.athletes )
		.sort( sort_by_last_name )
		.forEach(( key ) => {
			var athlete   = registration.athletes[ key ];
			var checkedin = athlete.checkedin ? true : false;
			var listing   = html.li.clone().addClass( 'list-group-item' ).attr({ 'data-key' : key });
			var name      = html.span.clone().addClass( 'athlete-name' ).append( athlete.name );
			var buttons   = html.div.clone().addClass( 'pull-right div-list-for-athlete' );
			listing.append( name );

			athlete.events.forEach(( divid ) => {
				var ev  = Object.keys( registration.events ).find(( ev ) => { return divid in registration.events[ ev ].divisions; });
				var div = registration.events[ ev ].divisions[ divid ];
				var b   = html.a.clone().addClass( 'btn btn-xs' ).html( divid.toUpperCase() );
				if     ( ! div.status            ) { b.addClass( 'btn-primary' ); } 
				else if( div.status == 'staged'  ) { b.addClass( 'btn-success' ); } 
				else if( div.status == 'staging' ) { b.addClass( 'btn-info' ); }
				buttons.append( b );
			});

			if( checkedin ) { 
				// ===== CHECK-OUT BEHAVIOR
				var timestamp = $.format.date( athlete.checkedin, 'ddd hh:mm a');
				var checkout = html.a.clone().addClass( 'btn btn-xs btn-danger' ).append( 'Checked in at ' + timestamp );
				buttons.append( checkout );
				checkout.off( 'click' ).click(( ev ) => {
					var target  = $( ev.target );
					var key     = target.parents( 'li.list-group-item' ).attr( 'data-key' );
					var athlete = registration.athletes[ key ];
					alertify.confirm( 
						`Undo check-in for ${athlete.name}?`, 
						`Click OK to confirm that ${athlete.name} was mistakenly checked-in or has gone missing.`,
						( ev ) => { 
							athlete.checkedin = undefined; 
							athlete.events.forEach(( divid ) => {
								var ev  = registration.divisions[ divid ];
								var div = registration.events[ ev ][ divid ];
								if( div.athletes.every( x => ! x.checkin )) {
									div.status = undefined;
									alertify.error( `Division ${divid.toUpperCase()} is now waiting` );
								} else if( div.athletes.some( x => x.checkin )) {
									div.status = 'staging';
									div.staged = undefined;
								}
							});
							refresh.checkin( registration ); 
						},
						( ev ) => {}
					);
				});
			} else {
				// ===== CHECK-IN BEHAVIOR
				var checkin = html.a.clone().addClass( 'btn btn-xs btn-success' ).html( 'Check-in' );
				var missing = html.a.clone().addClass( 'btn btn-xs' ).html( 'Missing' );
				if( ! defined( athlete.reportcalls )) { missing.addClass( 'btn-warning' ); } else { missing.addClass( 'btn-danger' ); }
				buttons.append( missing, checkin );
				checkin.off( 'click' ).click(( ev ) => {
					var target  = $( ev.target );
					var key     = target.parents( 'li.list-group-item' ).attr( 'data-key' );
					var athlete = registration.athletes[ key ];

					sound.next.play();

					alertify.message( `${athlete.name} has checked-in` );
					athlete.checkedin = new Date();
					athlete.events.forEach(( divid ) => {
						var ev  = registration.divisions[ divid ];
						var div = registration.events[ ev ][ divid ];
						if( div.athletes.every( x => x.checkin )) {
							div.status = 'staged';
							if( ! defined( div.staged )) { div.staged = new Date(); }
							alertify.success( `Division ${divid.toUpperCase()} is ready to compete`, 30 );
						} else if( div.athletes.some( x => x.checkin )) {
							div.status = 'staging';
						}
					});
					refresh.checkin( registration );
				});
				missing.off( 'click' ).click(( ev ) => {
					var target  = $( ev.target );
					var key     = target.parents( 'li.list-group-item' ).attr( 'data-key' );
					var athlete = registration.athletes[ key ];

					sound.previous.play();

					if( ! defined( athlete.reportcalls )) { athlete.reportcalls = []; }
					athlete.reportcalls.push( new Date());
					var calls   = athlete.reportcalls.length;
					if( calls >= 3 ) { 
						missing.removeClass( 'btn-danger' ).addClass( 'btn-default disabled' );
						alertify.error( `${athlete.name} has missed 3rd call and shall be disqualified at the ring` );
					} else {
						if( calls >= 1 ) { missing.removeClass( 'btn-warning' ).addClass( 'btn-danger' );}
						var call  = [ '-', '1st', '2nd', '3rd' ][ athlete.reportcalls.length ];
						var time  = $.format.date( athlete.reportcalls[ calls - 1 ], "h:mm a" );
						alertify.message( `${athlete.name} has missed ${call} call to report at ${time}` );
					}
				});
			}

			// ===== LAST NAME LETTER
			var letter    = athlete.last_name.substr( 0, 1 );
			var letterid  =`athlete-name-letter-separator-${letter}`;
			var list      = list = checkedin ? $( '#athletes-present .list-group' ) : $( '#athletes-registered .list-group' );
			if( list.children( '#' + letterid ).length == 0 ) {

				var separator = html.li.clone().addClass( 'list-group-item list-group-item-info' ).attr({ id: letterid });
				var go_top    = html.a.clone().addClass( 'go-top fa fa-chevron-circle-up' ).html( '&nbsp;' );
				var top_arrow = html.div.clone().addClass( 'pull-right' ).append( go_top );

				go_top.off( 'click' ).click(() => { $( '.page-checkin' ).animate({ scrollTop: 0 }, 350); })

				separator.append( letter );
				separator.append( top_arrow );
				
				list.append( separator );

				var scrollto = html.a.clone().addClass( 'btn btn-primary btn-xs go-down' ).html( letter );
				scrollto.off( 'click' ).click(( ev ) => {
					$( '.page-checkin' ).animate({ scrollTop: $( '#' + letterid ).offset().top - 12}, 350 );
				});
				list = checkedin ? $( '#athletes-present .btn-group' ) : $( '#athletes-registered .btn-group' );
				list.append( scrollto );
			}

			list = checkedin ? $( '#athletes-present .list-group' ) : $( '#athletes-registered .list-group' );
			listing.append( buttons );
			list.append( listing );
		}
	);

	// ============================================================
	// DIVISION CARDS
	// ============================================================
	$( '#divisions-in-staging .thumbnails' ).empty();

	var cols      = 4;
	var width     = Math.ceil( 12/cols );
	var divisions = [];
	var overall   = { staging: 0, staged: 0, all: 0 };

	// ===== DASHBOARD 
	overall.dashboard   = `<?php include( 'checkin/event-staging-dashboard.php' ) ?>`;
	$( '#divisions-in-staging .thumbnails' ).append( overall.dashboard );
	$( '#event-order' ).append( registration.event.order.map( ev => `<li class="list-group-item" draggable="true" data-event="${ev}"><span class="fa fa-arrows-v sortable-handles"></span>${ev}</li>` ));
	$( '.event-staging-dashboard .btn-group' ).append( registration.event.order.map( ev => `<a class="btn btn-xs btn-primary" data-event="${ev}">${ev}</a>` ));
	$( '.event-staging-dashboard .btn-group a' ).off( 'click' ).click(( ev ) => { 
		var target = $( ev.target ).hasClass( 'btn' ) ? $( ev.target ) : $( ev.target ).parents( '.btn' );
		var label  = target.attr( 'data-event' );
		var el     = $( `.event-progress[data-event="${label}"` );
		$( '.page-checkin' ).animate({ scrollTop: el.offset().top - 12 }, 350); 
	});
	var sorting = $( '.event-staging-dashboard .list-group' ).detach();
	$( '#event-order' ).sortable().off( 'sortupdate' ).bind( 'sortupdate', ( ev, ui ) => {
		var target = $( ev.target );
		registration.event.order = target.children( 'li' ).map(( i, item ) => { return $( item ).attr( 'data-event' ) }).toArray();
		refresh.checkin( registration );
	});

	registration.event.order.forEach(( ev ) => {
		var progress = `<?php include( 'checkin/event-label.php' ) ?>`;
		$( '#divisions-in-staging .thumbnails' ).append( progress );

		var row = html.div.clone().addClass( 'row' );
		$( '#divisions-in-staging .thumbnails' ).append( row );

		var count = { staging: 0, staged: 0, all: 0 };
		var i = 0;
		Object.keys( registration.events[ ev ].divisions ).forEach(( divid ) => {
			var div = registration.events[ ev ].divisions[ divid ];
			divisions.push( div );
			var desc         = div.description; desc = desc.replace( /\[/, "<br>[" );
			var cell         = html.div.clone().addClass( `col-xs-${width}` );
			var title        = html.div.clone().addClass( 'thumbnail-header' ).html( `<div class="title">${desc}</div>` );
			var n            = html.div.clone().addClass( 'pull-right' ).append( div.athletes.map( x => x.checkin ? 0 : 1 ).reduce(( a, b ) => { return a + b; }), '/', div.athletes.length );
			var id           = html.div.clone().addClass( 'thumbnail-divid' ).append( divid.toUpperCase(), n );
			var athletes     = div.athletes.sort( sort_by_last_name ).map( x => registration.athletes[ x.id ]);
			var participants = html.div.clone().addClass( 'thumbnail-athletes' ).html( div.athletes.map( x => { let athlete = registration.athletes[ x.id ]; if( x.checkin ) { return athlete.name; } else { return `<span class="text-danger">${athlete.name}</span>`; }} ).join( ', ' ));
			var thumb        = html.div.clone().addClass( `thumbnail` ).attr({ 'data-divid' : divid }).append( title, id, participants );
			cell.append( thumb );

			if( ! div.status )                   { title.addClass( 'thumbnail-waiting' ); }
			else if( div.status == 'staging'   ) { title.addClass( 'thumbnail-inprogress' ); }
			else if( div.status == 'staged'    ) { title.addClass( 'thumbnail-ready' ); }
			else if( div.status == 'at-ring'   ) { return; }
			else if( div.status == 'on-deck'   ) { return; }
			else if( div.status == 'competing' ) { return; }
			else if( div.status == 'done'      ) { return; }

			if( div.status ) { count[ div.status ]++; overall[ div.status ]++; }
			overall[ 'all' ]++;
			count[ 'all' ]++;

			if(! ( i % cols)) {
				row = html.div.clone().addClass( 'row' );
				$( '#divisions-in-staging .thumbnails' ).append( row );
			}
			row.append( cell );
			i++;
		});
		var percent = count.all == 0 ? 100 : Math.round((count.staged * 100)/count.all);
		var bar     = $( `.event-progress[data-event="${ev}"] .progress-bar` );
		if     ( percent <   25 ) { bar.addClass( 'progress-bar-danger' ); }
		else if( percent <   50 ) { bar.addClass( 'progress-bar-warning' ); }
		else if( percent <   75 ) { bar.addClass( 'progress-bar-info' ); }
		else if( percent <= 100 ) { bar.addClass( 'progress-bar-success' ); }
		bar.attr({ style : `width: ${percent}%`});
		bar.empty().html( `${percent}%` );
	});

	var percent = overall.all == 0 ? 100 : Math.round((overall.staged * 100)/overall.all);
	var pb      = $( '.event-staging-dashboard .progress-bar' );
	if     ( percent <   25 ) { pb.addClass( 'progress-bar-danger' ); }
	else if( percent <   50 ) { pb.addClass( 'progress-bar-warning' ); }
	else if( percent <   75 ) { pb.addClass( 'progress-bar-info' ); }
	else if( percent <= 100 ) { pb.addClass( 'progress-bar-success' ); }
	pb.attr({ style : `width: ${percent}%`});
	pb.empty().html( `${percent}%` );
	$( '#divisions-in-staging .event-progress .go-top' ).off( 'click' ).click(() => { $( '.page-checkin' ).animate({ scrollTop: 0 }, 350); })
};

</script>
