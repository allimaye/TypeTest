//// For an introduction to the Blank template, see the following documentation:
//// http://go.microsoft.com/fwlink/?LinkID=397704
//// To debug code on page load in Ripple or on Android devices/emulators: launch your app, set breakpoints, 
//// and then run "window.location.reload()" in the JavaScript Console.
//(function () {
//    "use strict";

//    document.addEventListener( 'deviceready', onDeviceReady.bind( this ), false );

//    function onDeviceReady() {
//        // Handle the Cordova pause and resume events
//        document.addEventListener( 'pause', onPause.bind( this ), false );
//        document.addEventListener( 'resume', onResume.bind( this ), false );
        
//        // TODO: Cordova has been loaded. Perform any initialization that requires Cordova here.
//    };

//    function onPause() {
//        // TODO: This application has been suspended. Save application state here.
//    };

//    function onResume() {
//        // TODO: This application has been reactivated. Restore application state here.
//    };
//} )();

(function () {

    //"use strict";

    var app = angular.module('typeTest', ['ngMaterial', 'ngMessages']);

    app.controller('FormController', function ($scope) {
        $scope.user = currentUser;
        $scope.est_speeds = type_speeds;
        $scope.chosen_speed = '';

    });

    app.controller('InputController', function ($scope, $mdDialog) {

        
        var words = "first second third fourth fifth sixth seventh eighth ninth tenth";
        var wordSplit = words.split(' ');
        //$scope.paragraph = getRandomParagraph("sample_paragraphs.txt");
        $scope.paragraph = [];
        $scope.totalChars = 0;
        for (var i = 0; i < wordSplit.length; i++)
        {
            $scope.paragraph.push({ "value": wordSplit[i], "color": "black" });
            $scope.totalChars += wordSplit[i].length;
        }

        $scope.wordsPerChar = wordSplit.length / $scope.totalChars;
        $scope.startTime = new Date();
        $scope.currentTime = $scope.startTime;

        $scope.inputVal = "";
        $scope.debugVal = "";
        $scope.determinateValue = 30;
        $scope.textToSpeech = false;

        $scope.currentWord = $scope.paragraph[0].value;
        $scope.counter = 0;
        $scope.wordCorrect = false;
        $scope.inputError = false;
        $scope.charCount = 0;


        $scope.speed = 20;
        $scope.accuracy = 90;
        $scope.precision = 70;



        

        


        $scope.$watch('inputVal', function (newVal, oldVal) {

            //if (newVal === oldVal) return;

            var lastChar = newVal.charAt(newVal.length - 1);

            //Case 1: Last character entered was a space
            if (lastChar == ' ')
            {
                //validate the word
                $scope.wordCorrect = newVal.trim() === $scope.currentWord;

                if ($scope.wordCorrect)
                {
                    $scope.paragraph[$scope.counter].color = "green";
                    $scope.counter++;
                    $scope.currentWord = $scope.paragraph[$scope.counter].value;
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
                //determine if the current word is being spelt correctly and show error if not
                $scope.inputError = newVal != $scope.currentWord.substring(0, newVal.length);
                
                //increment charcter count as long as last change is not a deletion of letters (false positive), and it is correct
                $scope.charCount += $scope.inputError || newVal.length < oldVal.length ? 0 : 1;
            }


            //$scope.debugVal = "newVal: " + newVal + ", oldVal: " + oldVal + ", charCount: " + $scope.charCount;
            $scope.debugVal = "startTime" + $scope.startTime + ", currentTime "+ $scope.currentTime;

            updateUIColors($scope.inputError)
            updateStatistics();
            

        });


        //$(document).ready(function () {
        //    $("#paragraphInput").on("keypress", function (eventData) {
               
        //        //detect that the last character entered was a space and then do a validation
        //        if(eventData.originalEvent.code == "Space")
        //        {
        //            //validate the word
        //            $scope.wordCorrect = $("#paragraphInput").val().trim() === $scope.currentWord;
        //            if ($scope.wordCorrect)
        //            {
        //                $scope.counter++;
        //                $scope.currentWord = $scope.paragraph[$scope.counter][0];
        //                $("#paragraphInput").val("");
        //            }
        //            else
        //            {
        //                //the user is trying to move onto a new word whilst having spelt the current word incorrectly
        //            }
        //        }
        //    });
        //});


        function updateProgressBar()
        {

        }
        
        function updateStatistics()
        {
            //update typing speed
            $scope.currentTime = new Date();
            var timeDiffInMins = ($scope.currentTime.getTime() - $scope.startTime.getTime()) / 1000 / 60;
            var charsPerMin = $scope.charCount / timeDiffInMins;
            var wpm = $scope.wordsPerChar * charsPerMin;
            $scope.speed = Math.round(wpm);
            
            //update precision

            //update accuracy
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

        $scope.showTestDialog = function () {
            //$mdDialog.show(
            //  $mdDialog.alert()
            //    .clickOutsideToClose(true)
            //    .title('Opening from offscreen')
            //    .textContent('Closing to offscreen')
            //    .ariaLabel('Offscreen Demo')
            //    .ok('Amazing!')
            //    // Or you can specify the rect to do the transition from
            //    .openFrom(
            //    {
            //        top: -50,
            //        width: 30,
            //        height: 80
            //    })
            //    .closeTo(
            //    {
            //        left: 1500
            //    })
            //);


            $mdDialog.show({
                scope: $scope,        // use parent scope in template
                preserveScope: true,
                templateUrl: 'UserInfo.html',
                onComplete: afterShowAnimation
            });

            // When the 'enter' animation finishes...
            function afterShowAnimation(scope, element, options) {
                // post-show code here: DOM element focus, etc.
            }

            $scope.closeDialog = function () {
                $mdDialog.hide();
            };
           


        };

       

        function getRandomParagraph(file) {

            //var rawFile = new XMLHttpRequest();
            //rawFile.open("GET", file, false);
            //rawFile.onreadystatechange = function () {
            //    if (rawFile.readyState === 4) {
            //        if (rawFile.status === 200 || rawFile.status == 0) {
            //            var allText = rawFile.responseText;
            //            alert(allText);
            //        }
            //    }
            //}
            //rawFile.send(null);
            //return rawFile.responseText;

            var paragraph = "Whether you're a student, secretary, office administrator, manager, computer programmer, or engineer, typing " +
            "is an invaluable skill. It's a skill that can open doors and enhance your career opportunities.";

            return paragraph.split(" ");
        }


       
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
            onComplete: $scope.showTestDialog
        }).then(function (response) {
            if (response == 'ok') {
                $mdDialog.hide();
            }
        });

        $(document).ready(function () {

            

        });



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
    


})();

