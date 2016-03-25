

(function () {


    var app = angular.module('typeTest', ['ngMaterial', 'ngMessages']);

    app.controller('FormController', function ($scope) {
        $scope.user = currentUser;
        $scope.est_speeds = type_speeds;
        $scope.chosen_speed = '';

    });

    app.controller('InputController', function ($scope, $mdDialog, $interval, $filter) {

        var words = getRandomParagraph("sample_paragraphs.txt");
        //var words = "first second third fourth fifth sixth seventh eighth ninth tenth";
        var wordSplit = words.split(' ');
        //$scope.paragraph = getRandomParagraph("sample_paragraphs.txt");
        $scope.paragraph = [];
        $scope.totalCorrectChars = 0;
        for (var i = 0; i < wordSplit.length; i++)
        {
            $scope.paragraph.push({ "value": wordSplit[i], "color": "black" });
            $scope.totalCorrectChars += wordSplit[i].length;
        }

        $scope.wordsPerChar = wordSplit.length / $scope.totalCorrectChars;
        $scope.wordSplitLength = wordSplit.length;
        $scope.startTime = null;
        $scope.currentTime = null;
        //$scope.startTime = new Date();
        //$scope.currentTime = $scope.startTime;
        $scope.timerTime = "";
        $scope.timerHandle = null;

        $scope.inputVal = "";
        $scope.debugVal = "";
        $scope.textToSpeech = false;

        $scope.currentWord = $scope.paragraph[0].value;
        $scope.counter = 0;
        $scope.wordCorrect = false;
        $scope.inputError = false;
        $scope.correctChars = 0;
        $scope.typedChars = 0;
        $scope.progress = $scope.correctChars / $scope.totalCorrectChars;

        $scope.speed = 20;
        $scope.accuracy = 90;

        $scope.$watch('inputVal', function (newVal, oldVal) {

            

            var lastChar = newVal.charAt(newVal.length - 1);

            //Case 1: Last character entered was a space
            if (lastChar == ' ')
            {
                //validate the word
                $scope.wordCorrect = newVal.trim() === $scope.currentWord;

                if ($scope.wordCorrect)
                {
                    //indicate visually that the word has been spelt correctly
                    $scope.paragraph[$scope.counter].color = "green";
                    //move on to the next word
                    $scope.counter++;

                    var isLastWord = $scope.counter === $scope.wordSplitLength;
                    if (isLastWord)
                    {
                        endOfTest();
                        return;
                    }

                    $scope.currentWord = $scope.paragraph[$scope.counter].value;
                    //reset input text box
                    $scope.inputVal = "";
                    $scope.wordCorrect = false;
                    if ($scope.textToSpeech)
                    {
                        responsiveVoice.speak($scope.currentWord);
                    }
                }
                else
                {
                    //the user is trying to move onto a new word whilst having spelt the current word incorrectly
                    $scope.inputError = true;
                }
            }

            //Case 2: Last character entered was not a space
            else
            {
                //record that a new non-space character has been typed (regardless of whether it is correct or not)
                $scope.typedChars += newVal.length > oldVal.length ? 1 : 0;

                //determine if the current word is being spelt correctly and show error if not
                $scope.inputError = newVal != $scope.currentWord.substring(0, newVal.length);
                
                //increment charcter count as long as last change is not a deletion of letters (false positive), and it is correct
                $scope.correctChars += $scope.inputError || newVal.length < oldVal.length ? 0 : 1;
            }


            //$scope.debugVal = "newVal: " + newVal + ", oldVal: " + oldVal + ", correctChars: " + $scope.correctChars;
            $scope.debugVal = "startTime" + $scope.startTime + ", currentTime "+ $scope.currentTime;

            updateUIColors($scope.inputError)
            updateStatistics();
            updateProgressBar();
            

        });



        

        function updateProgressBar()
        {
            $scope.progress = ($scope.counter / $scope.wordSplitLength) * 100;
        }
        
        function updateStatistics()
        {
            //update typing speed
            $scope.currentTime = new Date();
            var timeDiffInMins = ($scope.currentTime.getTime() - $scope.startTime.getTime()) / 1000 / 60;
            var charsPerMin = $scope.correctChars / timeDiffInMins;
            var wpm = $scope.wordsPerChar * charsPerMin;
            $scope.speed = Math.round(wpm);

            //update accuracy
            $scope.accuracy = Math.round(($scope.correctChars / $scope.typedChars) * 100);
            

        }

        function updateTimer()
        {
            //var milliseconds = (new Date().getTime() - $scope.startTime.getTime());
            //var seconds = (milliseconds / 1000);
            //var minutes = seconds / 60;
            //$scope.timerTime = ("0" + Math.round(minutes)).slice(-2) + ":" +
            //                        ("0" + Math.round(seconds)).slice(-2) + ":" +
            //                        ("0" + Math.round(milliseconds)).slice(-3);

            $scope.timerTime = $filter('date')(new Date().getTime() - $scope.startTime.getTime(), "mm:ss:sss");
        }

        function updateUIColors(inputError)
        {
            if (inputError) {
                //update text input color
                $("#paragraphInput").css({ "background-color": "#ff9999", "color": "#ff1a1a" });

                //update word color
                $scope.paragraph[$scope.counter].color = "red"
            }
            else
            {
                //update text input color
                $("#paragraphInput").css({ "background-color": "#ffffff", "color": "#000000" });

                //update word color
                $scope.paragraph[$scope.counter].color = "black"
            }
        }

        function getRandomParagraph(file) {

            var fileText = "";
            var rawFile = new XMLHttpRequest();
            rawFile.open("GET", file, false);
            rawFile.onreadystatechange = function () {
                if (rawFile.readyState === 4) {
                    if (rawFile.status === 200 || rawFile.status == 0) {
                        fileText = rawFile.responseText;
                    }
                }
            }
            rawFile.send(null);

            

            //select a random paragraph from the text file
            var random = Math.floor((Math.random() * 3));

            var allText = fileText.split('%')[random].trim();

            $scope.paragraphTitle = allText.split('>')[0].trim();

            return allText.split('>')[1].trim();
        }

        function endOfTest()
        {
            $scope.counter++;
        }


        $scope.showInstructionDialog = function () {

            $mdDialog.show({
                scope: $scope,        // use parent scope in template
                preserveScope: true,
                templateUrl: 'Instructions.html',
                openFrom: {
                    top: -50,
                    width: 30,
                    height: 80
                },
                closeTo: {
                    left: 1500
                },
                controller: function DialogController($scope, $mdDialog) {
                    $scope.moveToUserInfo = function () {
                        $mdDialog.templateUrl = 'UserInfo.html';
                    };

                    $scope.closeInstructionDialog = function () {
                        $mdDialog.hide();
                        $scope.showUserInfoDialog();
                    };

                    $scope.closeUserInfoDialog = function () {
                        $mdDialog.hide();
                        $scope.showTrafficLightAnimation();
                    };
                }
            });

        };

        $scope.showUserInfoDialog = function () {

            $mdDialog.show({
                scope: $scope,        // use parent scope in template
                preserveScope: true,
                templateUrl: 'UserInfo.html',
                
            }).then(function () {
                $("#paragraphInput").focus();
            });
        };
        
        $scope.showTrafficLightAnimation = function ()
        {
            $mdDialog.show({
                template:
                  '<md-dialog layout-wrap>' +
                  //'     <md-dialog-content>' +
                  '         <center><img src="../images/readySteadyGo.gif" height="232" width="122"/><center>' +
                  //'     </md-dialog-content>' +
                  '</md-dialog>',
                onComplete: afterShowAnimation,
                autoWrap: false
            });

            
            // When the 'enter' animation finishes...
            function afterShowAnimation(scope, element, options) {
                setTimeout(function () {
                    $mdDialog.hide();
                    $scope.startTime = new Date();
                    $scope.currentTime = new Date();
                    $scope.timerHandle = $interval(updateTimer, 10);
                }, 4500);
            }

        }

        $scope.showInstructionDialog();

    });


    app.controller('AppCtrl', function() {
        this.userState = '';
        this.states = ('AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS ' +
            'MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI ' +
            'WY').split(' ').map(function (state) { return { abbrev: state }; });
    });

    var currentUser = {
        firstname: '',
        lastname:''
    }

    var type_speeds = [];

    for(var i = 0; i < 150; i+=5)
    {
        type_speeds.push(i);
    }




    //$scope.$on('$viewContentLoaded', function () {
    //    var x = 2;
    //});
    


})();

