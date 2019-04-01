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
var registration = { "event" : { "order" : [ "Obstacle Course", "Grassroots [Kibon]", "Grassroots [Palgwe]", "Grassroots [Taegeuk]", "World Class Individual", "World Class Pairs or Teams", "Sparring", "Sparring [Weapons]", "Breaking [Power]", "Breaking [Speed]" ] }, "athletes" : { "03b3ed8d" : { "age" : "10", "belt" : "Purple Belt", "events" : [ "pb02a", "tp02b" ], "first_name" : "Rishay", "gender" : "Male", "last_name" : "RAM", "name" : "Rishay RAM", "weight" : "40.1" }, "0bd64d1a" : { "age" : "14", "belt" : "Black Belt", "events" : [ "pr01", "wc03" ], "first_name" : "Aditi", "gender" : "Female", "last_name" : "PARASURAM", "name" : "Aditi PARASURAM", "weight" : "0" }, "0d3b1ec1" : { "age" : "36", "belt" : "Black Belt", "events" : [ "ws01b" ], "first_name" : "Juan", "gender" : "Male", "last_name" : "LANDIN", "name" : "Juan LANDIN", "weight" : "72.7" }, "0f4c5f82" : { "age" : "9", "belt" : "Blue Belt with Black Stripe", "events" : [ "pb02b" ], "first_name" : "Laura", "gender" : "Female", "last_name" : "PEREZ", "name" : "Laura PEREZ", "weight" : "44.5" }, "12ea0f84" : { "age" : "14", "belt" : "Yellow Belt with Orange Stripe", "events" : [ "tp01f" ], "first_name" : "Griffin", "gender" : "Male", "last_name" : "BUI", "name" : "Griffin BUI", "weight" : "0" }, "1773ebe4" : { "age" : "16", "belt" : "Red Belt", "events" : [ "pb03b", "tp03d" ], "first_name" : "Steven", "gender" : "Male", "last_name" : "BHIRDO", "name" : "Steven BHIRDO", "weight" : "60.5" }, "1c46928d" : { "age" : "11", "belt" : "Black Belt", "events" : [ "wc02" ], "first_name" : "Andrew", "gender" : "Male", "last_name" : "KWOK", "name" : "Andrew KWOK", "weight" : "0" }, "1cbaf36d" : { "age" : "11", "belt" : "Black Belt", "events" : [ "wc01" ], "first_name" : "Gabriella", "gender" : "Female", "last_name" : "WONG", "name" : "Gabriella WONG", "weight" : "20.5" }, "1da1223c" : { "age" : "7", "belt" : "Green Belt", "events" : [ "tp02a" ], "first_name" : "Kirik", "gender" : "Male", "last_name" : "ALTEKAR", "name" : "Kirik ALTEKAR", "weight" : "0" }, "2422a6e0" : { "age" : "6", "belt" : "White Belt with Yellow Stripe", "events" : [ "kp01a" ], "first_name" : "Ria", "gender" : "Female", "last_name" : "RAM", "name" : "Ria RAM", "weight" : "0" }, "25ea873c" : { "age" : "11", "belt" : "Red Belt", "events" : [ "oc05b", "pp03a", "tp03c" ], "first_name" : "Justin", "gender" : "Male", "last_name" : "HUNG", "name" : "Justin HUNG", "weight" : "24.1" }, "2f8535d8" : { "age" : "13", "belt" : "Red Belt with Black Stripe", "events" : [ "pb03c", "tp03c" ], "first_name" : "Ittai", "gender" : "Male", "last_name" : "LUBITCH", "name" : "Ittai LUBITCH", "weight" : "41.4" }, "2fbf169d" : { "age" : "9", "belt" : "White Belt with Purple Stripe", "events" : [ "kp01e", "oc04" ], "first_name" : "Sradha", "gender" : "Female", "last_name" : "PRADEEP", "name" : "Sradha PRADEEP", "weight" : "26.4" }, "3044eb2a" : { "age" : "17", "belt" : "Red Belt with Black Stripe", "events" : [ "pb03a" ], "first_name" : "Parth", "gender" : "Male", "last_name" : "SHROTRI", "name" : "Parth SHROTRI", "weight" : "86.4" }, "311ad72c" : { "age" : "9", "belt" : "Orange Belt", "events" : [ "tp01d" ], "first_name" : "Shreya", "gender" : "Female", "last_name" : "SUJIT", "name" : "Shreya SUJIT", "weight" : "21.8" }, "318eaf21" : { "age" : "13", "belt" : "Red Belt with Black Stripe", "events" : [ "pp03b" ], "first_name" : "Ava", "gender" : "Female", "last_name" : "KWOK", "name" : "Ava KWOK", "weight" : "0" }, "31b97885" : { "age" : "49", "belt" : "Red Belt", "events" : [ "pp04" ], "first_name" : "Philip", "gender" : "Male", "last_name" : "WONG", "name" : "Philip WONG", "weight" : "70.5" }, "3ac7a356" : { "age" : "9", "belt" : "White Belt with Yellow Stripe", "events" : [ "kp01e", "oc04" ], "first_name" : "Reuben", "gender" : "Male", "last_name" : "KURZER", "name" : "Reuben KURZER", "weight" : "27.7" }, "3c47cd5b" : { "age" : "15", "belt" : "Black Belt", "events" : [ "wc05" ], "first_name" : "Arjun", "gender" : "Male", "last_name" : "KRISHNAN", "name" : "Arjun KRISHNAN", "weight" : "63.6" }, "3c820e77" : { "age" : "10", "belt" : "Purple Belt", "events" : [ "oc05b", "pb02a", "pp02b" ], "first_name" : "Benjamin", "gender" : "Male", "last_name" : "LECY-CHONG", "name" : "Benjamin LECY-CHONG", "weight" : "21.8" }, "40867a34" : { "age" : "9", "belt" : "Black Belt", "events" : [ "wc01" ], "first_name" : "Suri", "gender" : "Female", "last_name" : "YAU", "name" : "Suri YAU", "weight" : "0" }, "42016ee5" : { "age" : "12", "belt" : "Red Belt", "events" : [ "pp03b", "tp03c" ], "first_name" : "Aeden", "gender" : "Male", "last_name" : "BERMAN", "name" : "Aeden BERMAN", "weight" : "36.4" }, "43261bd8" : { "age" : "9", "belt" : "Brown Belt", "events" : [ "tp03a" ], "first_name" : "Pranay", "gender" : "Male", "last_name" : "BOKDE", "name" : "Pranay BOKDE", "weight" : "0" }, "44551ad2" : { "age" : "8", "belt" : "Yellow Belt with White Stripe", "events" : [ "oc03", "tp01b" ], "first_name" : "Adam", "gender" : "Male", "last_name" : "LEVY-CHONG", "name" : "Adam LEVY-CHONG", "weight" : "19.1" }, "45bac02a" : { "age" : "8", "belt" : "White Belt with Yellow Stripe", "events" : [ "kp01d" ], "first_name" : "Rannvijay", "gender" : "Male", "last_name" : "SINGH", "name" : "Rannvijay SINGH", "weight" : "0" }, "4849ba61" : { "age" : "11", "belt" : "Red Belt", "events" : [ "pb03c" ], "first_name" : "Daniel", "gender" : "Male", "last_name" : "PEREZ", "name" : "Daniel PEREZ", "weight" : "44.1" }, "48a120c2" : { "age" : "11", "belt" : "Red Belt with Black Stripe", "events" : [ "oc05b", "pb03d", "pp03a" ], "first_name" : "Suraj RAJESH", "gender" : "Male", "last_name" : "KUMAR", "name" : "Suraj RAJESH KUMAR", "weight" : "29.5" }, "49c90e7e" : { "age" : "7", "belt" : "Yellow Belt with White Stripe", "events" : [ "oc02a", "tp01a" ], "first_name" : "Diyaashree", "gender" : "Female", "last_name" : "SENTHILKUMAR", "name" : "Diyaashree SENTHILKUMAR", "weight" : "0" }, "4c3e764f" : { "age" : "12", "belt" : "Red Belt with Black Stripe", "events" : [ "tp03b" ], "first_name" : "Maya", "gender" : "Female", "last_name" : "KRISHNAN", "name" : "Maya KRISHNAN", "weight" : "43.2" }, "4fd8459e" : { "age" : "6", "belt" : "White Belt with Green Stripe", "events" : [ "kp01a", "oc01b" ], "first_name" : "Oren", "gender" : "Male", "last_name" : "SALINAS", "name" : "Oren SALINAS", "weight" : "0" }, "51151389" : { "age" : "5", "belt" : "Yellow Belt with White Stripe", "events" : [ "oc01b" ], "first_name" : "Derek", "gender" : "Male", "last_name" : "ALTEKAR", "name" : "Derek ALTEKAR", "weight" : "0" }, "55927606" : { "age" : "17", "belt" : "Black Belt", "events" : [ "sp04" ], "first_name" : "Sonaal", "gender" : "Male", "last_name" : "JAYAWARDENA", "name" : "Sonaal JAYAWARDENA", "weight" : "61.4" }, "590cd291" : { "age" : "12", "belt" : "Red Belt", "events" : [ "pp03b" ], "first_name" : "Krishna", "gender" : "Male", "last_name" : "ARVIND", "name" : "Krishna ARVIND", "weight" : "36.4" }, "5a3a5b44" : { "age" : "14", "belt" : "Red Belt with Black Stripe", "events" : [ "tp03d" ], "first_name" : "Sarvesh", "gender" : "Male", "last_name" : "AIYAGARI", "name" : "Sarvesh AIYAGARI", "weight" : "0" }, "5c1b41dc" : { "age" : "10", "belt" : "Blue Belt", "events" : [ "tp02c" ], "first_name" : "Siyona", "gender" : "Female", "last_name" : "KHER", "name" : "Siyona KHER", "weight" : "0" }, "5e26a956" : { "age" : "8", "belt" : "Yellow Belt with White Stripe", "events" : [ "kp01d", "tp01b" ], "first_name" : "Dylan", "gender" : "Male", "last_name" : "BERMAN", "name" : "Dylan BERMAN", "weight" : "30.5" }, "5f15251c" : { "age" : "30", "belt" : "Black Belt", "events" : [ "wc06" ], "first_name" : "Misol", "gender" : "Female", "last_name" : "DO", "name" : "Misol DO", "weight" : "47.3" }, "6c138d17" : { "age" : "14", "belt" : "Green Belt", "events" : [ "ws01a" ], "first_name" : "Annecy", "gender" : "Female", "last_name" : "BEGOLE", "name" : "Annecy BEGOLE", "weight" : "40.9" }, "6dfac1a7" : { "age" : "9", "belt" : "Brown Belt", "events" : [ "tp03a" ], "first_name" : "Huancheng (Ronnie)", "gender" : "Male", "last_name" : "WANG", "name" : "Huancheng (Ronnie) WANG", "weight" : "22.3" }, "73592387" : { "age" : "11", "belt" : "Black Belt", "events" : [ "wc01" ], "first_name" : "Kaylee", "gender" : "Female", "last_name" : "YOSHIDA", "name" : "Kaylee YOSHIDA", "weight" : "0" }, "74e2a0a5" : { "age" : "8", "belt" : "White Belt with Orange Stripe", "events" : [ "kp01d" ], "first_name" : "Saanvi", "gender" : "Female", "last_name" : "RATHOD", "name" : "Saanvi RATHOD", "weight" : "26" }, "7507c9eb" : { "age" : "11", "belt" : "White Belt with Yellow Stripe", "events" : [ "kp01f" ], "first_name" : "Hrishi", "gender" : "Male", "last_name" : "VIJAY", "name" : "Hrishi VIJAY", "weight" : "0" }, "754fa4ac" : { "age" : "7", "belt" : "White Belt with Blue Stripe", "events" : [ "kp01b" ], "first_name" : "Gayatri", "gender" : "Female", "last_name" : "UNNIKRISHNAN", "name" : "Gayatri UNNIKRISHNAN", "weight" : "0" }, "78f7e790" : { "age" : "7", "belt" : "White Belt with Yellow Stripe", "events" : [ "kp01c", "oc02b" ], "first_name" : "Ryan", "gender" : "Male", "last_name" : "TRUONG", "name" : "Ryan TRUONG", "weight" : "0" }, "79e25b09" : { "age" : "16", "belt" : "Red Belt with Black Stripe", "events" : [ "pp03c" ], "first_name" : "Kanav", "gender" : "Male", "last_name" : "MITTAL", "name" : "Kanav MITTAL", "weight" : "56.8" }, "7b73fbf8" : { "age" : "15", "belt" : "Green Belt with Black Stripe", "events" : [ "tp02d" ], "first_name" : "Sander", "gender" : "Male", "last_name" : "BOUCHARD", "name" : "Sander BOUCHARD", "weight" : "0" }, "7c996bb8" : { "age" : "7", "belt" : "White Belt", "events" : [ "kp01c", "oc02b" ], "first_name" : "Jordan", "gender" : "Male", "last_name" : "BENAVIDEZ", "name" : "Jordan BENAVIDEZ", "weight" : "21.8" }, "7ca362c4" : { "age" : "11", "belt" : "Green Belt", "events" : [ "pb02b", "sb01a", "sp01", "sp02" ], "first_name" : "Jeremias", "gender" : "Male", "last_name" : "STAUCH", "name" : "Jeremias STAUCH", "weight" : "44.1" }, "7e2725f2" : { "age" : "6", "belt" : "White Belt with Yellow Stripe", "events" : [ "oc01a" ], "first_name" : "Victor", "gender" : "Male", "last_name" : "TORRES-BERNARD", "name" : "Victor TORRES-BERNARD", "weight" : "23.2" }, "8354e666" : { "age" : "12", "belt" : "Yellow Belt with Orange Stripe", "events" : [ "tp01f" ], "first_name" : "Kartik Raj", "gender" : "Male", "last_name" : "SARAVANAN", "name" : "Kartik Raj SARAVANAN", "weight" : "30.9" }, "84876eae" : { "age" : "11", "belt" : "Red Belt with Black Stripe", "events" : [ "oc05a", "pp03a" ], "first_name" : "Kavinaya", "gender" : "Female", "last_name" : "SENTHILKUMAR", "name" : "Kavinaya SENTHILKUMAR", "weight" : "0" }, "856ab38e" : { "age" : "8", "belt" : "Yellow Belt with White Stripe", "events" : [ "oc03", "pp01a", "tp01c" ], "first_name" : "Dhriti", "gender" : "Female", "last_name" : "DEEPAK", "name" : "Dhriti DEEPAK", "weight" : "20.5" }, "8834f4d2" : { "age" : "13", "belt" : "Red Belt", "events" : [ "pp03b", "tp03c" ], "first_name" : "Saqif Ayaan", "gender" : "Male", "last_name" : "SUDHEER", "name" : "Saqif Ayaan SUDHEER", "weight" : "39.5" }, "88f77f01" : { "age" : "9", "belt" : "Yellow Belt with Orange Stripe", "events" : [ "tp01c" ], "first_name" : "Isla", "gender" : "Female", "last_name" : "BUI", "name" : "Isla BUI", "weight" : "0" }, "91cd8672" : { "age" : "9", "belt" : "Blue Belt", "events" : [ "tp02a" ], "first_name" : "Emily", "gender" : "Female", "last_name" : "KWOK", "name" : "Emily KWOK", "weight" : "0" }, "95621bd0" : { "age" : "11", "belt" : "Blue Belt", "events" : [ "tp02c" ], "first_name" : "Kaashvi", "gender" : "Female", "last_name" : "MITTAL", "name" : "Kaashvi MITTAL", "weight" : "0" }, "9db6b537" : { "age" : "15", "belt" : "Black Belt", "events" : [ "wc05" ], "first_name" : "Cleo", "gender" : "Female", "last_name" : "CHEN", "name" : "Cleo CHEN", "weight" : "48.2" }, "a1e336ca" : { "age" : "11", "belt" : "Orange Belt", "events" : [ "pb02b", "tp01e" ], "first_name" : "Samuel", "gender" : "Male", "last_name" : "LI", "name" : "Samuel LI", "weight" : "49.1" }, "a24800f7" : { "age" : "7", "belt" : "White Belt", "events" : [ "oc02a" ], "first_name" : "Phoebe", "gender" : "Female", "last_name" : "CAMP", "name" : "Phoebe CAMP", "weight" : "0" }, "a2a373be" : { "age" : "10", "belt" : "Green Belt", "events" : [ "oc05b", "tp02b" ], "first_name" : "Matthew", "gender" : "Male", "last_name" : "LIM", "name" : "Matthew LIM", "weight" : "0" }, "a63c0a4a" : { "age" : "6", "belt" : "White Belt with Yellow Stripe", "events" : [ "oc01b" ], "first_name" : "Kai", "gender" : "Male", "last_name" : "HUNG", "name" : "Kai HUNG", "weight" : "15.9" }, "a63ee8f3" : { "age" : "11", "belt" : "Green Belt", "events" : [ "sb01a" ], "first_name" : "Allon", "gender" : "Male", "last_name" : "LUBITCH", "name" : "Allon LUBITCH", "weight" : "34.4" }, "a6b75167" : { "age" : "15", "belt" : "Brown Belt", "events" : [ "pb03a", "sb01b", "sp03" ], "first_name" : "Serafin", "gender" : "Male", "last_name" : "STAUCH", "name" : "Serafin STAUCH", "weight" : "74.5" }, "a9622da6" : { "age" : "7", "belt" : "White Belt with Yellow Stripe", "events" : [ "kp01c", "oc02b" ], "first_name" : "Logan", "gender" : "Male", "last_name" : "CASHMAN", "name" : "Logan CASHMAN", "weight" : "0" }, "ac7d84b3" : { "age" : "6", "belt" : "Orange Belt", "events" : [ "oc01a", "tp01a" ], "first_name" : "Lena", "gender" : "Female", "last_name" : "SILBERSTEIN", "name" : "Lena SILBERSTEIN", "weight" : "20.5" }, "b12d04d5" : { "age" : "6", "belt" : "White Belt with Purple Stripe", "events" : [ "kp01a", "oc01a" ], "first_name" : "Jeffrey", "gender" : "Male", "last_name" : "LIM", "name" : "Jeffrey LIM", "weight" : "0" }, "b640f8d6" : { "age" : "9", "belt" : "Blue Belt with Black Stripe", "events" : [ "pp02b", "sp01" ], "first_name" : "Leo", "gender" : "Male", "last_name" : "SILBERSTEIN", "name" : "Leo SILBERSTEIN", "weight" : "24.1" }, "b7c4e0d4" : { "age" : "14", "belt" : "Red Belt with Black Stripe", "events" : [ "pp03b" ], "first_name" : "Max", "gender" : "Male", "last_name" : "WESTER", "name" : "Max WESTER", "weight" : "0" }, "baa45cb3" : { "age" : "7", "belt" : "White Belt with Yellow Stripe", "events" : [ "kp01b", "pb01" ], "first_name" : "Ava", "gender" : "Female", "last_name" : "ESSON", "name" : "Ava ESSON", "weight" : "24.5" }, "be0a308d" : { "age" : "9", "belt" : "Green Belt with Black Stripe", "events" : [ "pp02a" ], "first_name" : "Rayna", "gender" : "Female", "last_name" : "AMBROSE", "name" : "Rayna AMBROSE", "weight" : "0" }, "c0033c82" : { "age" : "9", "belt" : "Yellow Belt with White Stripe", "events" : [ "oc04", "pb01", "pp01b", "tp01c" ], "first_name" : "Kaira", "gender" : "Female", "last_name" : "PRADEEP", "name" : "Kaira PRADEEP", "weight" : "0" }, "c02fe14c" : { "age" : "14", "belt" : "Black Belt", "events" : [ "pb03a", "pr01", "sb01b", "sp03", "sp04", "wc04", "ws01b" ], "first_name" : "Adarsh", "gender" : "Male", "last_name" : "GUPTA", "name" : "Adarsh GUPTA", "weight" : "65.9" }, "c5e8268f" : { "age" : "11", "belt" : "Yellow Belt with Orange Stripe", "events" : [ "oc05a", "tp01e" ], "first_name" : "Sophie", "gender" : "Female", "last_name" : "BUI", "name" : "Sophie BUI", "weight" : "0" }, "c674fa54" : { "age" : "16", "belt" : "Brown Belt", "events" : [ "pb03b", "pp03c" ], "first_name" : "Kasiet", "gender" : "Female", "last_name" : "TEMIRALIEVA", "name" : "Kasiet TEMIRALIEVA", "weight" : "61.4" }, "d02ccbb4" : { "age" : "11", "belt" : "Brown Belt", "events" : [ "tp03b" ], "first_name" : "Skylar", "gender" : "Female", "last_name" : "YAU", "name" : "Skylar YAU", "weight" : "0" }, "d36d96f2" : { "age" : "12", "belt" : "Black Belt", "events" : [ "wc03" ], "first_name" : "Angelina", "gender" : "Female", "last_name" : "CUAN", "name" : "Angelina CUAN", "weight" : "28.2" }, "d4d42d68" : { "age" : "12", "belt" : "Red Belt", "events" : [ "sp02", "tp03b" ], "first_name" : "Samantha", "gender" : "Female", "last_name" : "REGI", "name" : "Samantha REGI", "weight" : "48.2" }, "d8da529c" : { "age" : "9", "belt" : "Orange Belt with Black Stripe", "events" : [ "oc04", "pp01b", "tp01d" ], "first_name" : "Sanya", "gender" : "Female", "last_name" : "CHOUDHARI", "name" : "Sanya CHOUDHARI", "weight" : "31.4" }, "d905362a" : { "age" : "12", "belt" : "Black Belt", "events" : [ "wc04" ], "first_name" : "Ajay", "gender" : "Male", "last_name" : "GOPINATH", "name" : "Ajay GOPINATH", "weight" : "47.7" }, "d9393a8c" : { "age" : "12", "belt" : "Yellow Belt with White Stripe", "events" : [ "ws01a" ], "first_name" : "Julian", "gender" : "Male", "last_name" : "CUDZINOVIC", "name" : "Julian CUDZINOVIC", "weight" : "50.9" }, "e4a350da" : { "age" : "15", "belt" : "Brown Belt with Black Stripe", "events" : [ "tp03d" ], "first_name" : "Anand", "gender" : "Male", "last_name" : "ASHAR", "name" : "Anand ASHAR", "weight" : "48.6" }, "e55b1766" : { "age" : "8", "belt" : "Yellow Belt with Orange Stripe", "events" : [ "oc03", "pp01a", "tp01b" ], "first_name" : "Ilan", "gender" : "Male", "last_name" : "SALINAS", "name" : "Ilan SALINAS", "weight" : "0" }, "e77d7a71" : { "age" : "10", "belt" : "White Belt", "events" : [ "kp01f", "oc05a" ], "first_name" : "Lucy", "gender" : "Female", "last_name" : "CAMP", "name" : "Lucy CAMP", "weight" : "0" }, "e9557c65" : { "age" : "9", "belt" : "Purple Belt", "events" : [ "pp02a" ], "first_name" : "Anamika", "gender" : "Female", "last_name" : "TOMER", "name" : "Anamika TOMER", "weight" : "0" }, "eb257e35" : { "age" : "15", "belt" : "Black Belt", "events" : [ "pb03b", "ws01b" ], "first_name" : "Aiden", "gender" : "Male", "last_name" : "BEGOLE", "name" : "Aiden BEGOLE", "weight" : "60.7" }, "f215db47" : { "age" : "35", "belt" : "Green Belt", "events" : [ "tp04" ], "first_name" : "Justin", "gender" : "Male", "last_name" : "BAUMLI", "name" : "Justin BAUMLI", "weight" : "76.4" }, "f21d56c1" : { "age" : "11", "belt" : "Black Belt", "events" : [ "pb03d", "wc02" ], "first_name" : "Parth", "gender" : "Male", "last_name" : "DHAULAKHANDI", "name" : "Parth DHAULAKHANDI", "weight" : "36.4" }, "f6bb6b2c" : { "age" : "9", "belt" : "Green Belt", "events" : [ "tp02a" ], "first_name" : "Anika", "gender" : "Female", "last_name" : "ATHALE", "name" : "Anika ATHALE", "weight" : "0" }, "f6bdb7e0" : { "age" : "16", "belt" : "Blue Belt", "events" : [ "tp02d" ], "first_name" : "Michelle", "gender" : "Female", "last_name" : "WALLERIUS", "name" : "Michelle WALLERIUS", "weight" : "0" } }, "events" : { "Breaking [Power]" : { "pb01" : { "athletes" : [ "baa45cb3", "c0033c82" ], "description" : "Power Breaking Beginner" }, "pb02a" : { "athletes" : [ "3c820e77", "03b3ed8d" ], "description" : "Power Breaking Light Intermediate" }, "pb02b" : { "athletes" : [ "7ca362c4", "0f4c5f82", "a1e336ca" ], "description" : "Power Breaking Heavy Intermediate" }, "pb03a" : { "athletes" : [ "c02fe14c", "3044eb2a", "a6b75167" ], "description" : "Power Breaking Fin Advanced" }, "pb03b" : { "athletes" : [ "eb257e35", "c674fa54", "1773ebe4" ], "description" : "Power Breaking Light Advanced" }, "pb03c" : { "athletes" : [ "4849ba61", "2f8535d8" ], "description" : "Power Breaking Middle Advanced" }, "pb03d" : { "athletes" : [ "f21d56c1", "48a120c2" ], "description" : "Power Breaking Heavy Advanced" } }, "Breaking [Speed]" : { "sb01a" : { "athletes" : [ "a63ee8f3", "7ca362c4" ], "description" : "Speed Breaking Intermediate" }, "sb01b" : { "athletes" : [ "c02fe14c", "a6b75167" ], "description" : "Speed Breaking Advanced" } }, "Grassroots [Kibon]" : { "kp01a" : { "athletes" : [ "b12d04d5", "4fd8459e", "2422a6e0" ], "description" : "6yo Beginner" }, "kp01b" : { "athletes" : [ "baa45cb3", "754fa4ac" ], "description" : "7yo Female Beginner" }, "kp01c" : { "athletes" : [ "7c996bb8", "a9622da6", "78f7e790" ], "description" : "7yo Male Beginner" }, "kp01d" : { "athletes" : [ "5e26a956", "45bac02a", "74e2a0a5" ], "description" : "8yo Beginner" }, "kp01e" : { "athletes" : [ "3ac7a356", "2fbf169d" ], "description" : "9yo Beginner" }, "kp01f" : { "athletes" : [ "7507c9eb", "e77d7a71" ], "description" : "10-11 Beginner" } }, "Grassroots [Palgwe]" : { "pp01a" : { "athletes" : [ "856ab38e", "e55b1766" ], "description" : "8yo Beginner" }, "pp01b" : { "athletes" : [ "c0033c82", "d8da529c" ], "description" : "9yo Beginner" }, "pp02a" : { "athletes" : [ "e9557c65", "be0a308d" ], "description" : "9yo Female Intermediate" }, "pp02b" : { "athletes" : [ "3c820e77", "b640f8d6" ], "description" : "8-11 Male Intermediate" }, "pp03a" : { "athletes" : [ "25ea873c", "84876eae", "48a120c2" ], "description" : "10-11 Advanced" }, "pp03b" : { "athletes" : [ "42016ee5", "318eaf21", "590cd291", "b7c4e0d4", "8834f4d2" ], "description" : "12-14 Advanced" }, "pp03c" : { "athletes" : [ "79e25b09", "c674fa54" ], "description" : "15-17 Advanced" }, "pp04" : { "athletes" : [ "31b97885" ], "description" : "Under 50 Advanced" } }, "Grassroots [Taegeuk]" : { "tp01a" : { "athletes" : [ "49c90e7e", "ac7d84b3" ], "description" : "6-7 Female Beginner" }, "tp01b" : { "athletes" : [ "44551ad2", "5e26a956", "e55b1766" ], "description" : "8-9 Male Beginner" }, "tp01c" : { "athletes" : [ "856ab38e", "88f77f01", "c0033c82" ], "description" : "8-9 Female Beginner [Group C]" }, "tp01d" : { "athletes" : [ "d8da529c", "311ad72c" ], "description" : "8-9 Female Beginner [Group D]" }, "tp01e" : { "athletes" : [ "a1e336ca", "c5e8268f" ], "description" : "10-11 Beginner" }, "tp01f" : { "athletes" : [ "12ea0f84", "8354e666" ], "description" : "12-14 Beginner" }, "tp02a" : { "athletes" : [ "f6bb6b2c", "91cd8672", "1da1223c" ], "description" : "6-9 Intermediate" }, "tp02b" : { "athletes" : [ "a2a373be", "03b3ed8d" ], "description" : "10-11 Male Intermediate" }, "tp02c" : { "athletes" : [ "95621bd0", "5c1b41dc" ], "description" : "10-11 Female Intermediate" }, "tp02d" : { "athletes" : [ "f6bdb7e0", "7b73fbf8" ], "description" : "15-17 Intermediate" }, "tp03a" : { "athletes" : [ "6dfac1a7", "43261bd8" ], "description" : "8-9 Male Advanced" }, "tp03b" : { "athletes" : [ "4c3e764f", "d4d42d68", "d02ccbb4" ], "description" : "10-14 Female Advanced" }, "tp03c" : { "athletes" : [ "42016ee5", "2f8535d8", "25ea873c", "8834f4d2" ], "description" : "10-14 Male Advanced" }, "tp03d" : { "athletes" : [ "e4a350da", "5a3a5b44", "1773ebe4" ], "description" : "12-17 Male Advanced" }, "tp04" : { "athletes" : [ "f215db47" ], "description" : "Under 40 Intermediate" } }, "Obstacle Course" : { "oc01a" : { "athletes" : [ "b12d04d5", "ac7d84b3", "7e2725f2" ], "description" : "5-6 Beginner [Group A]" }, "oc01b" : { "athletes" : [ "51151389", "a63c0a4a", "4fd8459e" ], "description" : "5-6 Beginner [Group B]" }, "oc02a" : { "athletes" : [ "49c90e7e", "a24800f7" ], "description" : "7yo Female Beginner" }, "oc02b" : { "athletes" : [ "7c996bb8", "a9622da6", "78f7e790" ], "description" : "7yo Male Beginner" }, "oc03" : { "athletes" : [ "44551ad2", "856ab38e", "e55b1766" ], "description" : "8yo Beginner" }, "oc04" : { "athletes" : [ "c0033c82", "3ac7a356", "d8da529c", "2fbf169d" ], "description" : "9yo Beginner" }, "oc05a" : { "athletes" : [ "84876eae", "e77d7a71", "c5e8268f" ], "description" : "10-11 Female" }, "oc05b" : { "athletes" : [ "3c820e77", "25ea873c", "a2a373be", "48a120c2" ], "description" : "10-11 Male" } }, "Sparring" : { "sp01" : { "athletes" : [ "7ca362c4", "b640f8d6" ], "description" : "8-11 Male Intermediate [Exhibition NHC]" }, "sp02" : { "athletes" : [ "7ca362c4", "d4d42d68" ], "description" : "10-14 Mixed Intermediate [Exhibition NHC]" }, "sp03" : { "athletes" : [ "c02fe14c", "a6b75167" ], "description" : "12-17 Male Advanced [Exhibition JSR]" }, "sp04" : { "athletes" : [ "c02fe14c", "55927606" ], "description" : "12-17 Male Black [Exhibition JSR]" } }, "Sparring [Weapons]" : { "ws01a" : { "athletes" : [ "6c138d17", "d9393a8c" ], "description" : "12-14 Weapons Beginner-Intermediate" }, "ws01b" : { "athletes" : [ "c02fe14c", "eb257e35", "0d3b1ec1" ], "description" : "Under 40 Black" } }, "World Class Individual" : { "wc01" : { "athletes" : [ "1cbaf36d", "73592387", "40867a34" ], "description" : "Youth Female Individuals" }, "wc02" : { "athletes" : [ "1c46928d", "f21d56c1" ], "description" : "Youth Male Individuals" }, "wc03" : { "athletes" : [ "0bd64d1a", "d36d96f2" ], "description" : "Cadet Female Individuals" }, "wc04" : { "athletes" : [ "c02fe14c", "d905362a" ], "description" : "Cadet Male Individuals" }, "wc05" : { "athletes" : [ "3c47cd5b", "9db6b537" ], "description" : "Junior Mixed Individuals" }, "wc06" : { "athletes" : [ "5f15251c" ], "description" : "Under 30 Individuals" } }, "World Class Pairs or Teams" : { "pr01" : { "athletes" : [ "c02fe14c", "0bd64d1a" ], "description" : "Junior Pairs" } } } };
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

	var athlete_checked_in = a => (registration.athletes[ a ].checkedin ? 1 : 0);

	var none_checked_in = ( a, b, i ) => {
		if( i == 1 ) { return ! a && ! b; }
		return a && !b;
	};

	var some_checked_in = ( a, b ) => { return a || b; };
	var all_checked_in  = ( a, b ) => { return a && b; };

	var num_checked_in = ( a, b, i ) => {
		return a + b;
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
				var ev  = registration.divisions[ divid ];
				var div = registration.events[ ev ][ divid ];
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
								if( div.athletes.map( athlete_checked_in ).reduce( none_checked_in )) {
									div.status = undefined;
									alertify.error( `Division ${divid.toUpperCase()} is now waiting` );
								} else if( div.athletes.map( athlete_checked_in ).reduce( some_checked_in )) {
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
						if( div.athletes.map( athlete_checked_in ).reduce( all_checked_in )) {
							div.status = 'staged';
							if( ! defined( div.staged )) { div.staged = new Date(); }
							alertify.success( `Division ${divid.toUpperCase()} is ready to compete`, 30 );
						} else if( div.athletes.map( athlete_checked_in ).reduce( some_checked_in )) {
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
		Object.keys( registration.events[ ev ]).forEach(( divid ) => {
			var div = registration.events[ ev ][ divid ];
			divisions.push( div );
			var desc         = div.description; desc = desc.replace( /\[/, "<br>[" );
			var cell         = html.div.clone().addClass( `col-xs-${width}` );
			var title        = html.div.clone().addClass( 'thumbnail-header' ).html( `<div class="title">${desc}</div>` );
			var n            = html.div.clone().addClass( 'pull-right' ).append( div.athletes.map( athlete_checked_in ).reduce( num_checked_in ), '/', div.athletes.length );
			var id           = html.div.clone().addClass( 'thumbnail-divid' ).append( divid.toUpperCase(), n );
			var athletes     = div.athletes.sort( sort_by_last_name ).map( key => registration.athletes[ key ]);
			var participants = html.div.clone().addClass( 'thumbnail-athletes' ).html( athletes.map( athlete => { if( athlete.checkedin ) { return athlete.name; } else { return `<span class="text-danger">${athlete.name}</span>`; }} ).join( ', ' ));
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
