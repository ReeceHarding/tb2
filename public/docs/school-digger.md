SchoolDigger API
Plans
Documentation
Change Log
Sign in
SchoolDigger API Documentation
Calls are made to https://api.schooldigger.com

Include the version number when calling the API. Doing this will ensure that your app will not break if we were to make changes.

SchoolDigger API V2.3
Get detailed data on over 120,000 schools and 18,500 districts in the U.S.
Version 2.3 introduces new AutoComplete-only API plans

Created by SchoolDigger
Contact the developer
AutocompleteShow/HideList OperationsExpand Operations
get /v2.3/autocomplete/schools
Returns a simple and quick list of schools for use in a client-typed autocomplete

Response Class (Status 200)
OK

ModelExample Value
{
  "schoolMatches": [
    {
      "schoolid": "string",
      "schoolName": "string",
      "city": "string",
      "state": "string",
      "zip": "string",
      "schoolLevel": "string",
      "lowGrade": "string",
      "highGrade": "string",
      "latitude": 0,
      "longitude": 0,
      "rank": 0,
      "rankOf": 0,
      "rankStars": 0,
      "ncesPrivateSchoolID": "string"
    }
  ]
}


Response Content Type 
application/json
Parameters
Parameter	Value	Description	Parameter Type	Data Type
q	
Search term for autocomplete (e.g. 'Lincol') (required)

query	string
qSearchCityStateName	
Extend the search term to include city and state (e.g. 'Lincoln el paso' matches Lincoln Middle School in El Paso) (optional)

query	boolean
st	
Two character state (e.g. 'CA') (optional -- leave blank to search entire U.S.)

query	string
level	
Search for schools at this level only. Valid values: 'Elementary', 'Middle', 'High', 'Alt', 'Private' (optional - leave blank to search for all schools)

query	string
districtID	
Search within SchoolDigger District ID (optional. Pro, Enterprise, and Autocomplete Pro levels only.)

query	string
boxLatitudeNW	
Search within a 'box' defined by (BoxLatitudeNW/BoxLongitudeNW) to (BoxLongitudeSE/BoxLatitudeSE) (optional. Pro, Enterprise, and Autocomplete Pro levels only.)

query	double
boxLongitudeNW	
Search within a 'box' defined by (BoxLatitudeNW/BoxLongitudeNW) to (BoxLongitudeSE/BoxLatitudeSE) (optional. Pro, Enterprise, and Autocomplete Pro levels only.)

query	double
boxLatitudeSE	
Search within a 'box' defined by (BoxLatitudeNW/BoxLongitudeNW) to (BoxLongitudeSE/BoxLatitudeSE) (optional. Pro, Enterprise, and Autocomplete Pro levels only.)

query	double
boxLongitudeSE	
Search within a 'box' defined by (BoxLatitudeNW/BoxLongitudeNW) to (BoxLongitudeSE/BoxLatitudeSE) (optional. Pro, Enterprise, and Autocomplete Pro levels only.)

query	double
returnCount	
Number of schools to return. Valid values: 1-20. (default: 10)

query	integer
appID	
(required)
Your API app id

query	string
appKey	
(required)
Your API app key

query	string
get /v2.3/autocomplete/districts
Returns a simple and quick list of districts for use in a client-typed autocomplete

Response Class (Status 200)
OK

ModelExample Value
{
  "districtMatches": [
    {
      "districtid": "string",
      "districtName": "string",
      "city": "string",
      "state": "string",
      "zip": "string",
      "lowGrade": "string",
      "highGrade": "string",
      "latitude": 0,
      "longitude": 0,
      "hasBoundary": true,
      "rank": 0,
      "rankOf": 0,
      "rankStars": 0
    }
  ]
}


Response Content Type 
application/json
Parameters
Parameter	Value	Description	Parameter Type	Data Type
q	
Search term for autocomplete (e.g. 'Lincol') (required)

query	string
st	
Two character state (e.g. 'CA') (optional -- leave blank to search entire U.S.)

query	string
boxLatitudeNW	
Search within a 'box' defined by (BoxLatitudeNW/BoxLongitudeNW) to (BoxLongitudeSE/BoxLatitudeSE) (optional. Pro, Enterprise API levels only.)

query	double
boxLongitudeNW	
Search within a 'box' defined by (BoxLatitudeNW/BoxLongitudeNW) to (BoxLongitudeSE/BoxLatitudeSE) (optional. Pro, Enterprise API levels only.)

query	double
boxLatitudeSE	
Search within a 'box' defined by (BoxLatitudeNW/BoxLongitudeNW) to (BoxLongitudeSE/BoxLatitudeSE) (optional. Pro, Enterprise API levels only.)

query	double
boxLongitudeSE	
Search within a 'box' defined by (BoxLatitudeNW/BoxLongitudeNW) to (BoxLongitudeSE/BoxLatitudeSE) (optional. Pro, Enterprise API levels only.)

query	double
returnCount	
Number of districts to return. Valid values: 1-20. (default: 10)

query	integer
appID	
(required)
Your API app id

query	string
appKey	
(required)
Your API app key

query	string
DistrictsShow/HideList OperationsExpand Operations
get /v2.3/districts
Returns a list of districts

Implementation Notes
Search the SchoolDigger database for districts. You may use any combination of criteria as query parameters.

Response Class (Status 200)
OK

ModelExample Value
{
  "districtList": [
    {
      "districtID": "string",
      "districtName": "string",
      "phone": "string",
      "url": "string",
      "address": {
        "latLong": {
          "latitude": 0,
          "longitude": 0
        },
        "street": "string",
        "city": "string",
        "state": "string",
        "stateFull": "string",
        "zip": "string",
        "zip4": "string",
        "cityURL": "string",
        "zipURL": "string",
        "html": "string"
      },
      "locationIsWithinBoundary": true,
      "hasBoundary": true,
      "distance": 0,
      "isWithinBoundary": true,
      "county": {
        "countyName": "string",
        "countyURL": "string"
      },
      "lowGrade": "string",
      "highGrade": "string",
      "numberTotalSchools": 0,
      "numberPrimarySchools": 0,
      "numberMiddleSchools": 0,
      "numberHighSchools": 0,
      "numberAlternativeSchools": 0,
      "rankHistory": [
        {
          "year": 0,
          "rank": 0,
          "rankOf": 0,
          "rankStars": 0,
          "rankStatewidePercentage": 0,
          "rankScore": 0
        }
      ],
      "districtYearlyDetails": [
        {
          "year": 0,
          "numberOfStudents": 0,
          "numberOfSpecialEdStudents": 0,
          "numberOfEnglishLanguageLearnerStudents": 0,
          "numberOfTeachers": 0,
          "numberOfTeachersPK": 0,
          "numberOfTeachersK": 0,
          "numberOfTeachersElementary": 0,
          "numberOfTeachersSecondary": 0,
          "numberOfAids": 0,
          "numberOfCoordsSupervisors": 0,
          "numberOfGuidanceElem": 0,
          "numberOfGuidanceSecondary": 0,
          "numberOfGuidanceTotal": 0,
          "numberOfLibrarians": 0,
          "numberOfLibraryStaff": 0,
          "numberOfLEAAdministrators": 0,
          "numberOfLEASupportStaff": 0,
          "numberOfSchoolAdministrators": 0,
          "numberOfSchoolAdminSupportStaff": 0,
          "numberOfStudentSupportStaff": 0,
          "numberOfOtherSupportStaff": 0
        }
      ]
    }
  ],
  "numberOfDistricts": 0,
  "numberOfPages": 0
}


Response Content Type 
application/json
Parameters
Parameter	Value	Description	Parameter Type	Data Type
st	
(required)
Two character state (e.g. 'CA') - required

query	string
q	
Search term - note: will match district name or city (optional)

query	string
city	
Search for districts in this city (optional)

query	string
zip	
Search for districts in this 5-digit zip code (optional)

query	string
nearLatitude	
Search for districts within (distanceMiles) of (nearLatitude)/(nearLongitude) (e.g. 44.982560) (optional) (Pro, Enterprise API levels only. Enterprise API level will flag districts that include lat/long in its attendance boundary.)

query	double
nearLongitude	
Search for districts within (distanceMiles) of (nearLatitude)/(nearLongitude) (e.g. -124.289185) (optional) (Pro, Enterprise API levels only. Enterprise API level will flag districts that include lat/long in its attendance boundary.)

query	double
boundaryAddress	
Full U.S. address: flag returned districts that include this address in its attendance boundary. Example: '123 Main St. AnyTown CA 90001' (optional) (Enterprise API level only)

query	string
distanceMiles	
Search for districts within (distanceMiles) of (nearLatitude)/(nearLongitude) (Default 50 miles) (optional) (Pro, Enterprise API levels only)

query	integer
isInBoundaryOnly	
Return only the districts that include given location (nearLatitude/nearLongitude) or (boundaryAddress) in its attendance boundary (Enterprise API level only)

query	boolean
boxLatitudeNW	
Search for districts within a 'box' defined by (BoxLatitudeNW/BoxLongitudeNW) to (BoxLongitudeSE/BoxLatitudeSE) (optional)

query	double
boxLongitudeNW	
Search for districts within a 'box' defined by (BoxLatitudeNW/BoxLongitudeNW) to (BoxLongitudeSE/BoxLatitudeSE) (optional)

query	double
boxLatitudeSE	
Search for districts within a 'box' defined by (BoxLatitudeNW/BoxLongitudeNW) to (BoxLongitudeSE/BoxLatitudeSE) (optional)

query	double
boxLongitudeSE	
Search for districts within a 'box' defined by (BoxLatitudeNW/BoxLongitudeNW) to (BoxLongitudeSE/BoxLatitudeSE) (optional)

query	double
page	
Page number to retrieve (optional, default: 1)

query	integer
perPage	
Number of districts to retrieve on a page (50 max) (optional, default: 10)

query	integer
sortBy	
Sort list. Values are: districtname, distance, rank. For descending order, precede with '-' i.e. -districtname (optional, default: districtname)

query	string
includeUnrankedDistrictsInRankSort	
If sortBy is 'rank', this boolean determines if districts with no rank are included in the result (optional, default: false)

query	boolean
appID	
(required)
Your API app id

query	string
appKey	
(required)
Your API app key

query	string
get /v2.3/districts/{id}
Returns a detailed record for one district

Implementation Notes
Retrieve a single district record from the SchoolDigger database

Response Class (Status 200)
OK

ModelExample Value
{
  "districtID": "string",
  "districtName": "string",
  "phone": "string",
  "url": "string",
  "address": {
    "latLong": {
      "latitude": 0,
      "longitude": 0
    },
    "street": "string",
    "city": "string",
    "state": "string",
    "stateFull": "string",
    "zip": "string",
    "zip4": "string",
    "cityURL": "string",
    "zipURL": "string",
    "html": "string"
  },
  "lowGrade": "string",
  "highGrade": "string",
  "numberTotalSchools": 0,
  "numberPrimarySchools": 0,
  "numberMiddleSchools": 0,
  "numberHighSchools": 0,
  "numberAlternativeSchools": 0,
  "boundary": {
    "polylineCollection": [
      {
        "polylineOverlayEncodedPoints": "string",
        "numberEncodedPoints": 0
      }
    ],
    "polylines": "string",
    "hasBoundary": true
  },
  "finance": [
    {
      "year": 0,
      "spendingPerStudent": 0,
      "spendingFederalPersonnel": 0,
      "spendingFederalNonPersonnel": 0,
      "spendingStateLocalPersonnel": 0,
      "spendingStateLocalNonPersonnel": 0,
      "spendingPerStudentFederal": 0,
      "spendingPerStudentStateLocal": 0
    }
  ],
  "graduationRates": [
    {
      "year": 0,
      "schoolGraduationRate": 0,
      "districtGraduationRate": 0,
      "stateGraduationRate": 0
    }
  ],
  "dropoutRates": [
    {
      "year": 0,
      "schoolDropoutRate": 0,
      "districtDropoutRate": 0,
      "stateDropoutRate": 0
    }
  ],
  "chronicAbsenteeismRates": [
    {
      "year": 0,
      "schoolChronicAbsenteeismRate": 0,
      "districtChronicAbsenteeismRate": 0,
      "stateChronicAbsenteeismRate": 0
    }
  ],
  "isWithinBoundary": true,
  "county": {
    "countyName": "string",
    "countyURL": "string"
  },
  "rankHistory": [
    {
      "year": 0,
      "rank": 0,
      "rankOf": 0,
      "rankStars": 0,
      "rankStatewidePercentage": 0,
      "rankScore": 0
    }
  ],
  "districtYearlyDetails": [
    {
      "year": 0,
      "numberOfStudents": 0,
      "numberOfSpecialEdStudents": 0,
      "numberOfEnglishLanguageLearnerStudents": 0,
      "numberOfTeachers": 0,
      "numberOfTeachersPK": 0,
      "numberOfTeachersK": 0,
      "numberOfTeachersElementary": 0,
      "numberOfTeachersSecondary": 0,
      "numberOfAids": 0,
      "numberOfCoordsSupervisors": 0,
      "numberOfGuidanceElem": 0,
      "numberOfGuidanceSecondary": 0,
      "numberOfGuidanceTotal": 0,
      "numberOfLibrarians": 0,
      "numberOfLibraryStaff": 0,
      "numberOfLEAAdministrators": 0,
      "numberOfLEASupportStaff": 0,
      "numberOfSchoolAdministrators": 0,
      "numberOfSchoolAdminSupportStaff": 0,
      "numberOfStudentSupportStaff": 0,
      "numberOfOtherSupportStaff": 0
    }
  ],
  "testScores": [
    {
      "test": "string",
      "subject": "string",
      "year": 0,
      "grade": "string",
      "schoolTestScore": {
        "studentsEligible": 0,
        "studentsTested": 0,
        "meanScaledScore": 0,
        "percentMetStandard": 0,
        "numberMetStandard": 0,
        "numTier1": 0,
        "numTier2": 0,
        "numTier3": 0,
        "numTier4": 0,
        "numTier5": 0,
        "percentTier1": 0,
        "percentTier2": 0,
        "percentTier3": 0,
        "percentTier4": 0,
        "percentTier5": 0
      },
      "districtTestScore": {
        "studentsEligible": 0,
        "studentsTested": 0,
        "meanScaledScore": 0,
        "percentMetStandard": 0,
        "numberMetStandard": 0,
        "numTier1": 0,
        "numTier2": 0,
        "numTier3": 0,
        "numTier4": 0,
        "numTier5": 0,
        "percentTier1": 0,
        "percentTier2": 0,
        "percentTier3": 0,
        "percentTier4": 0,
        "percentTier5": 0
      },
      "stateTestScore": {
        "studentsEligible": 0,
        "studentsTested": 0,
        "meanScaledScore": 0,
        "percentMetStandard": 0,
        "numberMetStandard": 0,
        "numTier1": 0,
        "numTier2": 0,
        "numTier3": 0,
        "numTier4": 0,
        "numTier5": 0,
        "percentTier1": 0,
        "percentTier2": 0,
        "percentTier3": 0,
        "percentTier4": 0,
        "percentTier5": 0
      },
      "tier1": "string",
      "tier2": "string",
      "tier3": "string",
      "tier4": "string",
      "tier5": "string"
    }
  ]
}


Response Content Type 
application/json
Parameters
Parameter	Value	Description	Parameter Type	Data Type
id	
(required)
The 7 digit District ID (e.g. 0642150)

path	string
appID	
(required)
Your API app id

query	string
appKey	
(required)
Your API app key

query	string
RankingsShow/HideList OperationsExpand Operations
get /v2.3/rankings/schools/{st}
Returns a SchoolDigger school ranking list

Response Class (Status 200)
OK

ModelExample Value
{
  "rankYear": 0,
  "rankYearCompare": 0,
  "rankYearsAvailable": [
    0
  ],
  "numberOfSchools": 0,
  "numberOfPages": 0,
  "schoolList": [
    {
      "schoolid": "string",
      "schoolName": "string",
      "phone": "string",
      "url": "string",
      "urlCompare": "string",
      "address": {
        "latLong": {
          "latitude": 0,
          "longitude": 0
        },
        "street": "string",
        "city": "string",
        "state": "string",
        "stateFull": "string",
        "zip": "string",
        "zip4": "string",
        "cityURL": "string",
        "zipURL": "string",
        "html": "string"
      },
      "distance": 0,
      "locale": "string",
      "lowGrade": "string",
      "highGrade": "string",
      "schoolLevel": "string",
      "isCharterSchool": "string",
      "isMagnetSchool": "string",
      "isVirtualSchool": "string",
      "isTitleISchool": "string",
      "isTitleISchoolwideSchool": "string",
      "district": {
        "districtID": "string",
        "districtName": "string",
        "url": "string",
        "rankURL": "string"
      },
      "county": {
        "countyName": "string",
        "countyURL": "string"
      },
      "rankHistory": [
        {
          "year": 0,
          "rank": 0,
          "rankOf": 0,
          "rankStars": 0,
          "rankLevel": "string",
          "rankStatewidePercentage": 0,
          "averageStandardScore": 0
        }
      ],
      "rankMovement": 0,
      "schoolYearlyDetails": [
        {
          "year": 0,
          "numberOfStudents": 0,
          "percentFreeDiscLunch": 0,
          "percentofAfricanAmericanStudents": 0,
          "percentofAsianStudents": 0,
          "percentofHispanicStudents": 0,
          "percentofIndianStudents": 0,
          "percentofPacificIslanderStudents": 0,
          "percentofWhiteStudents": 0,
          "percentofTwoOrMoreRaceStudents": 0,
          "percentofUnspecifiedRaceStudents": 0,
          "teachersFulltime": 0,
          "pupilTeacherRatio": 0,
          "numberofAfricanAmericanStudents": 0,
          "numberofAsianStudents": 0,
          "numberofHispanicStudents": 0,
          "numberofIndianStudents": 0,
          "numberofPacificIslanderStudents": 0,
          "numberofWhiteStudents": 0,
          "numberofTwoOrMoreRaceStudents": 0,
          "numberofUnspecifiedRaceStudents": 0
        }
      ],
      "isPrivate": true,
      "privateDays": 0,
      "privateHours": 0,
      "privateHasLibrary": true,
      "privateCoed": "string",
      "privateOrientation": "string"
    }
  ]
}


Response Content Type 
application/json
Parameters
Parameter	Value	Description	Parameter Type	Data Type
st	
(required)
Two character state (e.g. 'CA')

path	string
year	
The ranking year (leave blank for most recent year)

query	integer
level	
Level of ranking: 'Elementary', 'Middle', or 'High'

query	string
page	
Page number to retrieve (optional, default: 1)

query	integer
perPage	
Number of schools to retrieve on a page (50 max) (optional, default: 10)

query	integer
appID	
(required)
Your API app id

query	string
appKey	
(required)
Your API app key

query	string
get /v2.3/rankings/districts/{st}
Returns a SchoolDigger district ranking list

Response Class (Status 200)
OK

ModelExample Value
{
  "rankYear": 0,
  "rankYearCompare": 0,
  "rankYearsAvailable": [
    0
  ],
  "numberOfDistricts": 0,
  "numberOfPages": 0,
  "districtList": [
    {
      "districtID": "string",
      "districtName": "string",
      "phone": "string",
      "url": "string",
      "address": {
        "latLong": {
          "latitude": 0,
          "longitude": 0
        },
        "street": "string",
        "city": "string",
        "state": "string",
        "stateFull": "string",
        "zip": "string",
        "zip4": "string",
        "cityURL": "string",
        "zipURL": "string",
        "html": "string"
      },
      "locationIsWithinBoundary": true,
      "hasBoundary": true,
      "distance": 0,
      "isWithinBoundary": true,
      "county": {
        "countyName": "string",
        "countyURL": "string"
      },
      "lowGrade": "string",
      "highGrade": "string",
      "numberTotalSchools": 0,
      "numberPrimarySchools": 0,
      "numberMiddleSchools": 0,
      "numberHighSchools": 0,
      "numberAlternativeSchools": 0,
      "rankHistory": [
        {
          "year": 0,
          "rank": 0,
          "rankOf": 0,
          "rankStars": 0,
          "rankStatewidePercentage": 0,
          "rankScore": 0
        }
      ],
      "districtYearlyDetails": [
        {
          "year": 0,
          "numberOfStudents": 0,
          "numberOfSpecialEdStudents": 0,
          "numberOfEnglishLanguageLearnerStudents": 0,
          "numberOfTeachers": 0,
          "numberOfTeachersPK": 0,
          "numberOfTeachersK": 0,
          "numberOfTeachersElementary": 0,
          "numberOfTeachersSecondary": 0,
          "numberOfAids": 0,
          "numberOfCoordsSupervisors": 0,
          "numberOfGuidanceElem": 0,
          "numberOfGuidanceSecondary": 0,
          "numberOfGuidanceTotal": 0,
          "numberOfLibrarians": 0,
          "numberOfLibraryStaff": 0,
          "numberOfLEAAdministrators": 0,
          "numberOfLEASupportStaff": 0,
          "numberOfSchoolAdministrators": 0,
          "numberOfSchoolAdminSupportStaff": 0,
          "numberOfStudentSupportStaff": 0,
          "numberOfOtherSupportStaff": 0
        }
      ]
    }
  ],
  "rankCompareYear": 0
}


Response Content Type 
application/json
Parameters
Parameter	Value	Description	Parameter Type	Data Type
st	
(required)
Two character state (e.g. 'CA')

path	string
year	
The ranking year (leave blank for most recent year)

query	integer
page	
Page number to retrieve (optional, default: 1)

query	integer
perPage	
Number of districts to retrieve on a page (50 max) (optional, default: 10)

query	integer
appID	
(required)
Your API app id

query	string
appKey	
(required)
Your API app key

query	string
SchoolsShow/HideList OperationsExpand Operations
get /v2.3/schools
Returns a list of schools

Implementation Notes
Search the SchoolDigger database for schools. You may use any combination of criteria as query parameters.

Response Class (Status 200)
OK

ModelExample Value
{
  "numberOfSchools": 0,
  "numberOfPages": 0,
  "schoolList": [
    {
      "schoolid": "string",
      "schoolName": "string",
      "phone": "string",
      "url": "string",
      "urlCompare": "string",
      "address": {
        "latLong": {
          "latitude": 0,
          "longitude": 0
        },
        "street": "string",
        "city": "string",
        "state": "string",
        "stateFull": "string",
        "zip": "string",
        "zip4": "string",
        "cityURL": "string",
        "zipURL": "string",
        "html": "string"
      },
      "distance": 0,
      "locale": "string",
      "lowGrade": "string",
      "highGrade": "string",
      "schoolLevel": "string",
      "isCharterSchool": "string",
      "isMagnetSchool": "string",
      "isVirtualSchool": "string",
      "isTitleISchool": "string",
      "isTitleISchoolwideSchool": "string",
      "district": {
        "districtID": "string",
        "districtName": "string",
        "url": "string",
        "rankURL": "string"
      },
      "county": {
        "countyName": "string",
        "countyURL": "string"
      },
      "rankHistory": [
        {
          "year": 0,
          "rank": 0,
          "rankOf": 0,
          "rankStars": 0,
          "rankLevel": "string",
          "rankStatewidePercentage": 0,
          "averageStandardScore": 0
        }
      ],
      "rankMovement": 0,
      "schoolYearlyDetails": [
        {
          "year": 0,
          "numberOfStudents": 0,
          "percentFreeDiscLunch": 0,
          "percentofAfricanAmericanStudents": 0,
          "percentofAsianStudents": 0,
          "percentofHispanicStudents": 0,
          "percentofIndianStudents": 0,
          "percentofPacificIslanderStudents": 0,
          "percentofWhiteStudents": 0,
          "percentofTwoOrMoreRaceStudents": 0,
          "percentofUnspecifiedRaceStudents": 0,
          "teachersFulltime": 0,
          "pupilTeacherRatio": 0,
          "numberofAfricanAmericanStudents": 0,
          "numberofAsianStudents": 0,
          "numberofHispanicStudents": 0,
          "numberofIndianStudents": 0,
          "numberofPacificIslanderStudents": 0,
          "numberofWhiteStudents": 0,
          "numberofTwoOrMoreRaceStudents": 0,
          "numberofUnspecifiedRaceStudents": 0
        }
      ],
      "isPrivate": true,
      "privateDays": 0,
      "privateHours": 0,
      "privateHasLibrary": true,
      "privateCoed": "string",
      "privateOrientation": "string",
      "ncesPrivateSchoolID": "string"
    }
  ]
}


Response Content Type 
application/json
Parameters
Parameter	Value	Description	Parameter Type	Data Type
st	
(required)
Two character state (e.g. 'CA') - required

query	string
q	
Search term - note: will match school name or city (optional)

query	string
qSearchSchoolNameOnly	
For parameter 'q', only search school names instead of school and city (optional)

query	boolean
districtID	
Search for schools within this district (7 digit district id) (optional)

query	string
level	
Search for schools at this level. Valid values: 'Elementary', 'Middle', 'High', 'Alt', 'Public', 'Private' (optional). 'Public' returns all Elementary, Middle, High and Alternative schools

query	string
city	
Search for schools in this city (optional)

query	string
zip	
Search for schools in this 5-digit zip code (optional)

query	string
isMagnet	
True = return only magnet schools, False = return only non-magnet schools (optional) (Pro, Enterprise API levels only)

query	boolean
isCharter	
True = return only charter schools, False = return only non-charter schools (optional) (Pro, Enterprise API levels only)

query	boolean
isVirtual	
True = return only virtual schools, False = return only non-virtual schools (optional) (Pro, Enterprise API levels only)

query	boolean
isTitleI	
True = return only Title I schools, False = return only non-Title I schools (optional) (Pro, Enterprise API levels only)

query	boolean
isTitleISchoolwide	
True = return only Title I school-wide schools, False = return only non-Title I school-wide schools (optional) (Pro, Enterprise API levels only)

query	boolean
nearLatitude	
Search for schools within (distanceMiles) of (nearLatitude)/(nearLongitude) (e.g. 44.982560) (optional) (Pro, Enterprise API levels only.)

query	double
nearLongitude	
Search for schools within (distanceMiles) of (nearLatitude)/(nearLongitude) (e.g. -124.289185) (optional) (Pro, Enterprise API levels only.)

query	double
nearAddress	
Search for schools within (distanceMiles) of this address. Example: '123 Main St. AnyTown CA 90001' (optional) (Pro, Enterprise API level only) IMPORTANT NOTE: If you have the lat/long of the address, use nearLatitude and nearLongitude instead for much faster response times

query	string
distanceMiles	
Search for schools within (distanceMiles) of (nearLatitude)/(nearLongitude) (Default 5 miles) (optional) (Pro, Enterprise API levels only)

query	integer
boxLatitudeNW	
Search for schools within a 'box' defined by (boxLatitudeNW/boxLongitudeNW) to (boxLongitudeSE/boxLatitudeSE) (optional)

query	double
boxLongitudeNW	
Search for schools within a 'box' defined by (boxLatitudeNW/boxLongitudeNW) to (boxLongitudeSE/boxLatitudeSE) (optional)

query	double
boxLatitudeSE	
Search for schools within a 'box' defined by (boxLatitudeNW/boxLongitudeNW) to (boxLongitudeSE/boxLatitudeSE) (optional)

query	double
boxLongitudeSE	
Search for schools within a 'box' defined by (boxLatitudeNW/boxLongitudeNW) to (boxLongitudeSE/boxLatitudeSE) (optional)

query	double
page	
Page number to retrieve (optional, default: 1)

query	integer
perPage	
Number of schools to retrieve on a page (50 max) (optional, default: 10)

query	integer
sortBy	
Sort list. Values are: schoolname, distance, rank. For descending order, precede with '-' i.e. -schoolname (optional, default: schoolname)

query	string
includeUnrankedSchoolsInRankSort	
If sortBy is 'rank', this boolean determines if schools with no rank are included in the result (optional, default: false)

query	boolean
appID	
(required)
Your API app id

query	string
appKey	
(required)
Your API app key

query	string
get /v2.3/schools/{id}
Returns a detailed record for one school

Implementation Notes
Retrieve a school record from the SchoolDigger database

Response Class (Status 200)
OK

ModelExample Value
{
  "schoolid": "string",
  "schoolName": "string",
  "phone": "string",
  "url": "string",
  "urlSchoolDigger": "string",
  "urlCompareSchoolDigger": "string",
  "address": {
    "latLong": {
      "latitude": 0,
      "longitude": 0
    },
    "street": "string",
    "city": "string",
    "state": "string",
    "stateFull": "string",
    "zip": "string",
    "zip4": "string",
    "cityURL": "string",
    "zipURL": "string",
    "html": "string"
  },
  "locale": "string",
  "lowGrade": "string",
  "highGrade": "string",
  "schoolLevel": "string",
  "isCharterSchool": "string",
  "isMagnetSchool": "string",
  "isVirtualSchool": "string",
  "isTitleISchool": "string",
  "isTitleISchoolwideSchool": "string",
  "isPrivate": true,
  "privateDays": 0,
  "privateHours": 0,
  "privateHasLibrary": true,
  "privateCoed": "string",
  "privateOrientation": "string",
  "ncesPrivateSchoolID": "string",
  "district": {
    "districtID": "string",
    "districtName": "string",
    "url": "string",
    "rankURL": "string"
  },
  "county": {
    "countyName": "string",
    "countyURL": "string"
  },
  "reviews": [
    {
      "submitDate": "string",
      "numberOfStars": 0,
      "comment": "string",
      "submittedBy": "string"
    }
  ],
  "finance": [
    {
      "year": 0,
      "spendingPerStudent": 0,
      "spendingFederalPersonnel": 0,
      "spendingFederalNonPersonnel": 0,
      "spendingStateLocalPersonnel": 0,
      "spendingStateLocalNonPersonnel": 0,
      "spendingPerStudentFederal": 0,
      "spendingPerStudentStateLocal": 0
    }
  ],
  "graduationRates": [
    {
      "year": 0,
      "schoolGraduationRate": 0,
      "districtGraduationRate": 0,
      "stateGraduationRate": 0
    }
  ],
  "dropoutRates": [
    {
      "year": 0,
      "schoolDropoutRate": 0,
      "districtDropoutRate": 0,
      "stateDropoutRate": 0
    }
  ],
  "chronicAbsenteeismRates": [
    {
      "year": 0,
      "schoolChronicAbsenteeismRate": 0,
      "districtChronicAbsenteeismRate": 0,
      "stateChronicAbsenteeismRate": 0
    }
  ],
  "rankHistory": [
    {
      "year": 0,
      "rank": 0,
      "rankOf": 0,
      "rankStars": 0,
      "rankLevel": "string",
      "rankStatewidePercentage": 0,
      "averageStandardScore": 0
    }
  ],
  "rankMovement": 0,
  "testScores": [
    {
      "test": "string",
      "subject": "string",
      "year": 0,
      "grade": "string",
      "schoolTestScore": {
        "studentsEligible": 0,
        "studentsTested": 0,
        "meanScaledScore": 0,
        "percentMetStandard": 0,
        "numberMetStandard": 0,
        "numTier1": 0,
        "numTier2": 0,
        "numTier3": 0,
        "numTier4": 0,
        "numTier5": 0,
        "percentTier1": 0,
        "percentTier2": 0,
        "percentTier3": 0,
        "percentTier4": 0,
        "percentTier5": 0
      },
      "districtTestScore": {
        "studentsEligible": 0,
        "studentsTested": 0,
        "meanScaledScore": 0,
        "percentMetStandard": 0,
        "numberMetStandard": 0,
        "numTier1": 0,
        "numTier2": 0,
        "numTier3": 0,
        "numTier4": 0,
        "numTier5": 0,
        "percentTier1": 0,
        "percentTier2": 0,
        "percentTier3": 0,
        "percentTier4": 0,
        "percentTier5": 0
      },
      "stateTestScore": {
        "studentsEligible": 0,
        "studentsTested": 0,
        "meanScaledScore": 0,
        "percentMetStandard": 0,
        "numberMetStandard": 0,
        "numTier1": 0,
        "numTier2": 0,
        "numTier3": 0,
        "numTier4": 0,
        "numTier5": 0,
        "percentTier1": 0,
        "percentTier2": 0,
        "percentTier3": 0,
        "percentTier4": 0,
        "percentTier5": 0
      },
      "tier1": "string",
      "tier2": "string",
      "tier3": "string",
      "tier4": "string",
      "tier5": "string"
    }
  ],
  "schoolYearlyDetails": [
    {
      "year": 0,
      "numberOfStudents": 0,
      "percentFreeDiscLunch": 0,
      "percentofAfricanAmericanStudents": 0,
      "percentofAsianStudents": 0,
      "percentofHispanicStudents": 0,
      "percentofIndianStudents": 0,
      "percentofPacificIslanderStudents": 0,
      "percentofWhiteStudents": 0,
      "percentofTwoOrMoreRaceStudents": 0,
      "percentofUnspecifiedRaceStudents": 0,
      "teachersFulltime": 0,
      "pupilTeacherRatio": 0,
      "numberofAfricanAmericanStudents": 0,
      "numberofAsianStudents": 0,
      "numberofHispanicStudents": 0,
      "numberofIndianStudents": 0,
      "numberofPacificIslanderStudents": 0,
      "numberofWhiteStudents": 0,
      "numberofTwoOrMoreRaceStudents": 0,
      "numberofUnspecifiedRaceStudents": 0
    }
  ]
}


Response Content Type 
application/json
Parameters
Parameter	Value	Description	Parameter Type	Data Type
id	
(required)
The 12 digit School ID (e.g. 064215006903)

path	string
appID	
(required)
Your API app id

query	string
appKey	
(required)
Your API app key

query	string
[ base url: , api version: v2.3 ]

Documentation for previous API versions:
  Version 1.0
  Version 1.1
  Version 1.2
  Version 2.0
  Version 2.1
  Version 2.2


To see what's changed from version to version, check out the API Updates tab on the Change Log.

Batch Mode: We now support making several API calls in one batch! Contact us for more information and implementation details.


© 2025 SchoolDigger.com,
Powered by 3scale

