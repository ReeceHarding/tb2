// Open browser console and paste this to add mock quiz data to localStorage
const mockQuizData = {
  userType: 'Parent',
  grade: '5th Grade',
  selectedSchools: [{
    name: 'Local Elementary School',
    city: 'Austin',
    state: 'TX'
  }],
  kidsInterests: ['Math', 'Science', 'Art'],
  numberOfKids: 1
};

const mockGeneratedContent = {
  afternoonActivities: {
    header: "Your child's afternoon will be amazing",
    activities: ["Sports", "Art", "Reading"]
  },
  allCompleted: true,
  hasErrors: false
};

localStorage.setItem('timebackQuizData', JSON.stringify(mockQuizData));
localStorage.setItem('timebackGeneratedContent', JSON.stringify(mockGeneratedContent));
console.log('Mock data added to localStorage');
