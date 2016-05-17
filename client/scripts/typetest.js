

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
            //most logical but also most taxing way to determine typing speed
            var wpm1 = wordsPerChar * charsPerMin;
            //For the second approach, take the average length of a word in English to be 5.1 characters
            var wordsPerChar2 = 1 / 5.1;
            var wpm2 = wordsPerChar2 * charsPerMin;

            //take weigted average of results from both algorithms
            var combined = wpm1 * 0.7 + wpm2 * 0.3;
            combined *= 1.15;
            metrics.speed = Math.round(combined);

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



        $scope.init = function (firstTime) {

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
                timerHandle: null,
                inputFlashHandle: null,
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

            if(!firstTime)
            {
                $scope.times.timerHandle = $interval(updateTimerAndStats, 10);
            }
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
            //UpdateSvc.updateStatistics($scope.times, $scope.correctChars, $scope.wordsPerChar,
            //                                $scope.typedChars, $scope.metrics);
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
            var numParagraphs = fileText.split('%').length;
            var random = Math.floor((Math.random() * numParagraphs));
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
            $interval.cancel($scope.times.timerHandle);

            $scope.showResultsDialog();
            
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
                        $scope.showUserInfoDialog();
                    };

                    $scope.closeUserInfoDialog = function () {
                        $scope.showTrafficLightAnimation();
                    };
                }
            });

        };

        $scope.showUserInfoDialog = function () {

            $mdDialog.show({
                scope: $scope,        // use parent scope in template
                preserveScope: true,
                templateUrl: 'UserInfo.html'
                
            }).then(function () {
                $scope.times.inputFlashHandle = $interval(flashRedBorder, 750);
            });
        };
        
        $scope.showTrafficLightAnimation = function () {
            $mdDialog.show({
                template:
                  '<md-dialog layout-wrap>' +
                  '         <center><img src="../images/readySteadyGo2.gif" height="232" width="122"/><center>' +
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
                    $scope.times.timerHandle = $interval(updateTimerAndStats, 10);
                }, 2000);
            }
        };

        function updateTimerAndStats() {
            $scope.times.timerTime = $filter('date')(new Date().getTime() - $scope.times.startTime.getTime(), "mm:ss:sss");
            UpdateSvc.updateStatistics($scope.times, $scope.correctChars, $scope.wordsPerChar,
                                            $scope.typedChars, $scope.metrics);
            
        }

        $scope.showResultsDialog = function () {
            var statsCard = angular.element(document.querySelector('#stats'));

            var results = "Your estimated typing speed was " + $scope.user.estimatedSpeed +
                " wpm. Your actual speed was " + $scope.metrics.speed + " wpm.";

            var confirm = $mdDialog.confirm()
                  .title('Results for ' + $scope.user.firstname + ' ' + $scope.user.lastname)
                  .textContent(results)
                  .ariaLabel('Finished!')
                  .openFrom(statsCard)
                  .ok('Play Again')
                  .cancel('Cancel');
            $mdDialog.show(confirm).then(function () {
                $scope.init(false);
            }, function () {
                //do nothing
            });

        };

        //setup border flash to stop upon input focus
        $("#paragraphInput").focus(function () {
            $interval.cancel($scope.times.inputFlashHandle);
            $("#textInput").removeClass("red-border");
        });

        function flashRedBorder() {
            $("#textInput").toggleClass("red-border");
        }
        
        $scope.user = {
            firstname: '',
            lastname: '',
            estimatedSpeed: 10
        };
        $scope.init(true);
        $scope.showInstructionDialog();

    });

})();

