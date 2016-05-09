

(function () {


    var app = angular.module('typeTest', ['ngMaterial', 'ngMessages']);



    app.service('UpdateSvc', function () {

        this.updateUIColors = function (inputError, paragraph, counter) {

            if (inputError) {
                //update text input color
                $("#paragraphInput").css({ "background-color": "#ff9999", "color": "#ff1a1a" });

                //update word color
                paragraph[counter].color = "red"
            }
            else {
                //update text input color
                $("#paragraphInput").css({ "background-color": "#ffffff", "color": "#000000" });

                //update word color
                paragraph[counter].color = "black"
            }

        };

        this.updateStatistics = function (times, correctChars, wordsPerChar, typedChars, metrics) {

            //update typing speed
            times.currentTime = new Date();
            var timeDiffInMins = (times.currentTime.getTime() - times.startTime.getTime()) / 1000 / 60;
            var charsPerMin = correctChars / timeDiffInMins;
            var wpm = wordsPerChar * charsPerMin;
            metrics.speed = Math.round(wpm);

            //update accuracy
            metrics.accuracy = Math.round((correctChars / typedChars) * 100);
        };

        this.updateProgressBar = function (metrics, counter, wordSplitLength) {
            metrics.progress = (counter / wordSplitLength) * 100;
        };


    });


    app.controller('InputController', function ($scope, $mdDialog, $interval, $filter, UpdateSvc) {

        //controller variables
        var words;
        var wordSplit;
        $scope.paragraph;
        $scope.totalCorrectChars;
        $scope.wordsPerChar;
        $scope.wordSplitLength;
        $scope.times;
        $scope.inputVal;
        $scope.textToSpeech;
        $scope.currentWord;
        $scope.counter;
        $scope.wordCorrect;
        $scope.inputError;
        $scope.correctChars;
        $scope.typedChars;
        $scope.metrics;
        $scope.user;



        $scope.init = function () {

            words = getRandomParagraph("sample_paragraphs.txt");
            //var words = "first second third fourth fifth sixth seventh eighth ninth tenth";
            wordSplit = words.split(' ');
            //$scope.paragraph = getRandomParagraph("sample_paragraphs.txt");
            $scope.paragraph = [];
            $scope.totalCorrectChars = 0;

            for (var i = 0; i < wordSplit.length; i++) {
                $scope.paragraph.push({ "value": wordSplit[i], "color": "black" });
                $scope.totalCorrectChars += wordSplit[i].length;
            }

            $scope.wordsPerChar = wordSplit.length / $scope.totalCorrectChars;
            $scope.wordSplitLength = wordSplit.length;
            $scope.times = {
                startTime: new Date(),
                currentTime: new Date(),
                timerTime: "",
                timerHandle: null
            };


            $scope.inputVal = "";
            $scope.debugVal = "";
            $scope.textToSpeech = false;

            $scope.currentWord = $scope.paragraph[0].value;
            $scope.counter = 0;
            $scope.wordCorrect = false;
            $scope.inputError = false;
            $scope.correctChars = 0;
            $scope.typedChars = 0;

            $scope.metrics = {
                speed: 20,
                accuracy: 90,
                progress: $scope.correctChars / $scope.totalCorrectChars
            };
        };



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

            UpdateSvc.updateUIColors($scope.inputError, $scope.paragraph, $scope.counter);
            UpdateSvc.updateStatistics($scope.times, $scope.correctChars, $scope.wordsPerChar,
                                            $scope.typedChars, $scope.metrics);
            UpdateSvc.updateProgressBar($scope.metrics, $scope.counter, $scope.wordSplitLength);
            

        });


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
            $scope.inputVal = "";
            UpdateSvc.updateStatistics($scope.times, $scope.correctChars, $scope.wordsPerChar,
                                            $scope.typedChars, $scope.metrics);
            UpdateSvc.updateProgressBar($scope.metrics, $scope.counter, $scope.wordSplitLength);
            
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
                        //$mdDialog.hide();
                        $scope.showUserInfoDialog();
                    };

                    $scope.closeUserInfoDialog = function () {
                        //$mdDialog.hide();
                        $scope.showTrafficLightAnimation();
                    };

                    //$scope.answerToResults = function (answer) {
                    //    $mdDialog.hide();
                    //    if (answer === "Play Again") $scope.init();
                    //};
                }
            });

        };

        $scope.showUserInfoDialog = function () {

            $mdDialog.show({
                scope: $scope,        // use parent scope in template
                preserveScope: true,
                templateUrl: 'UserInfo.html'
                
            }).then(function () {
                $("#paragraphInput").focus();
            });
        };
        
        $scope.showTrafficLightAnimation = function () {
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
                    $scope.times.startTime = new Date();
                    $scope.times.currentTime = new Date();
                    $scope.times.timerHandle = $interval(updateTimer, 10);
                }, 4500);
            }

            function updateTimer() {
                $scope.times.timerTime = $filter('date')(new Date().getTime() - $scope.times.startTime.getTime(), "mm:ss:sss");
            }

        };

        //$scope.showResultsDialog = function () {
        //    var statsCard = angular.element(document.querySelector('#stats'));

        //    $mdDialog.show({
        //        scope: $scope,        // use parent scope in template
        //        preserveScope: true,
        //        templateUrl: 'Instructions.html',
        //        openFrom: statsCard
        //    });
           
        //};
        
        $scope.user = {
            firstname: '',
            lastname: '',
            estimatedSpeed: 0
        };
        $scope.init();
        $scope.showInstructionDialog();

    });

})();

