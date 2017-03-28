/**
 * jspsych-survey-multi-choice
 * a jspsych plugin for multiple choice survey questions
 *
 * Shane Martin
 *
 * documentation: docs.jspsych.org
 *
 */


jsPsych.plugins['image-multi-choice'] = (function() {

  var plugin = {};

  plugin.trial = function(display_element, trial) {

    var plugin_id_name = "jspsych-image-multi-choice";
    var plugin_id_selector = '#' + plugin_id_name;
    var _join = function( /*args*/ ) {
      var arr = Array.prototype.slice.call(arguments, _join.length);
      return arr.join(separator = '-');
    }

    // trial defaults
    trial.images = typeof trial.images == 'undefined' ? null : trial.images;
    trial.preamble = typeof trial.preamble == 'undefined' ? "" : trial.preamble;
    trial.required = typeof trial.required == 'undefined' ? null : trial.required;
    trial.horizontal = typeof trial.required == 'undefined' ? false : trial.horizontal;
    trial.progress_report  = typeof trial.progress_report === 'undefined' ? '' : trial.progress_report;
    trial.image_time = typeof trial.image_time == 'undefined' ? 5000 : trial.image_time;


    // if any trial variables are functions
    // this evaluates the function and replaces
    // it with the output of the function
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

    // this array holds handlers from setTimeout calls
    // that need to be cleared if the trial ends early
    var setTimeoutHandlers = [];

    // add border
    display_element.css({
      'width': '750',
      'height': '660',
      'margin': 'auto',
      'margin-top': '15px',
      'position': 'relative',
      'padding': '20px',
      'border': '2px solid',
      'border-radius': '25px'
    });

    // show the images
    display_element.append($('<table>', {
      "id": 'jspsych-image-multi-choice-table',
      "css": {"text-align": "center","vertical-align": "bottom","margin":"auto","float":"left",'width':'350'}
    }));
    //append four images as two rows in the table
    // add question text
    $("#jspsych-image-multi-choice-table").append($('<tr>',{"id": 'jspsych-image-multi-choice-ims0'}));
    $("#jspsych-image-multi-choice-ims0").append($('<td><p class="' + plugin_id_name + '-text survey-multi-choice">'+trial.questions[0] +'</p></td>'));
    $("#jspsych-image-multi-choice-table").append($('<tr>',{"id": 'jspsych-image-multi-choice-ims1'}));
    $("#jspsych-image-multi-choice-ims1").append($('<td><img src='+trial.images[0] +' class="jspsych-sim-image" style="width:350px;height:350px;" > </td>'));//
    $("#jspsych-image-multi-choice-table").append($('<tr>',{"id": 'jspsych-image-multi-choice-ims2'}));
    // create right panel to hold the progress_report
    $("#jspsych-image-multi-choice-ims2").append($("<div>",{
      "id":'right_panel'
    }));

    // hide image if timing is set
    if (trial.image_time > 0) {
      var t1 = setTimeout(function() {
        $('#jspsych-image-multi-choice-ims1').replaceWith('<p id="jspsych-VBET-warning">Please still respond <br>even if the picture was removed. </p>');
        //$('#jspsych-single-stim-stimulus').css('visibility', 'hidden');
      }, trial.image_time);
      setTimeoutHandlers.push(t1);
    }

    // display progress
    if (trial.progress_report == "true") {
      $("#right_panel").append($('<div>', {
        "html": "<p>"+"Progress: "+(jsPsych.progress().current_trial_global)+"/"+(jsPsych.progress().total_trials-2)+"</p>",
        "id": "jspsych-progress-report",
        "class": "jspsych-free-sort-arena",
        "css": {"border-style": "none"}
      }));
    }

    // form element
    var trial_form_id = _join(plugin_id_name, "form");
    display_element.append($('<form>', {
      "id": trial_form_id
    }));
    var $trial_form = $("#" + trial_form_id);
    $trial_form.css({
      'width': '300',
      'position': 'relative',
      'padding': '10px',
      'float': 'right'
    });
    // show preamble text
    var preamble_id_name = _join(plugin_id_name, 'preamble');
    $trial_form.append($('<div>', {
      "id": preamble_id_name,
      "class": preamble_id_name
    }));
    $('#' + preamble_id_name).html(trial.preamble);

    // add multiple-choice questions
    for (var i = 0; i < trial.questions.length; i++) {

      // create question container
      var question_classes = [_join(plugin_id_name, 'question')];
      if (trial.horizontal) {
        question_classes.push(_join(plugin_id_name, 'horizontal'));
      }

      $trial_form.append($('<div>', {
        "id": _join(plugin_id_name, i),
        "class": question_classes.join(' ')//,
        //"css": {"float":"right"}
      }));

      var question_selector = _join(plugin_id_selector, i);

      // create option radio buttons
      for (var j = 0; j < trial.options[i].length; j++) {
        var option_id_name = _join(plugin_id_name, "option", i, j),
          option_id_selector = '#' + option_id_name;

        // add radio button container
        $(question_selector).append($('<div>', {
          "id": option_id_name,
          "class": _join(plugin_id_name, 'option')
        }));

        // add label and question text
        var option_label = '<label class="' + plugin_id_name + '-text">' + trial.options[i][j] + '</label>';
        $(option_id_selector).append(option_label);

        // create radio button
        var input_id_name = _join(plugin_id_name, 'response', i);
        $(option_id_selector + " label").prepend('<input type="radio" name="' + input_id_name + '" value="' + trial.options[i][j] + '">');
      }

      if (trial.required && trial.required[i]) {
        // add "question required" asterisk
        $(question_selector + " p").append("<span class='required'>*</span>")

        // add required property
        $(question_selector + " input:radio").prop("required", true);
      }
    }

    // add submit button
    $trial_form.append($('<div>', {
      // 'type': 'submit',
      // 'id': plugin_id_name + '-next',
      // 'class': plugin_id_name + ' jspsych-btn',
      // 'value': 'Submit Answers'
      'html': '<input type="submit" id="next" style = {"border":"2px solid"} class="'+plugin_id_name+' jspsych-btn" value="Next">',
      'css': {'margin':'auto',"text-align":"center","padding":"20px"}
    }));


    $trial_form.submit(function(event) {

      event.preventDefault();

      // measure response time
      var endTime = (new Date()).getTime();
      var response_time = endTime - startTime;

      // kill any remaining setTimeout handlers
      for (var i = 0; i < setTimeoutHandlers.length; i++) {
        clearTimeout(setTimeoutHandlers[i]);
      }

      // create object to hold responses
      var question_data = {};
      $("div." + plugin_id_name + "-question").each(function(index) {
        var id = "Q" + index;
        var val = $(this).find("input:radio:checked").val();
        var obje = {};
        obje[id] = val;
        $.extend(question_data, obje);
      });

      // save data
      var trial_data = {
        "rt": response_time,
        "responses": JSON.stringify(question_data)
      };

      // if 1/5 trials completed, give feedback
      var nbreak = 60;
      if ((jsPsych.progress().current_trial_global)%nbreak == 0) {
        display_element.html('');
        var prompts = ["","1/5 compeleted. Great job!","2/5 completed. Well done!","3/5 completed. Keep it up!","4/5 completed. The home stretch!","Mission completed! Fantastic. You made my day!"];
        display_element.append("<p>"+prompts[((jsPsych.progress().current_trial_global)/nbreak)]+"</p>");
        display_element.append(getFeedback());

        function getFeedback() {
          var trials = jsPsych.data.getTrialsOfType('image-multi-choice');
          var ncrt = nsparrowAcc = nwarblerAcc = nsparrow = nwarbler = 0;
          var birdind = birdInfo.bird;
          var familyind = birdInfo.family;
          for (var i = 0; i < trials.length; i++) {
            ncrt = ncrt + trials[i].responses.includes(trials[i].bird[0]);
            var fkey = birdind.indexOf(trials[i].responses.split('"')[3]); // convert to family name
            var itemacc = Number(familyind[fkey]==trials[i].family[0]);
            switch (trials[i].family[0]) {
            case "Wood-Warblers":
                nwarbler = nwarbler + 1;
                nwarblerAcc = nwarblerAcc+itemacc;
                break;
            case "New World Sparrows and Allies":
                nsparrow = nsparrow + 1;
                nsparrowAcc = nsparrowAcc+itemacc;
                break;
            }
          }
          return "<p>So far you have correctly identified " + ncrt + " out of " +
                  jsPsych.progress().current_trial_global + " birds.</p>" +
                  "<br>Also,you correctly identified " + nsparrowAcc + " out of " +
                  nsparrow + " Sparrows and " + nwarblerAcc + " out of " + nwarbler + " Warblers.";
        }

        display_element.append($('<div>', {
          'id': 'next_div',
          'class': 'sim',
          'html': '<button class= "jspsych-btn" type="button" id="next">Next</button>',
          'css': {"margin": "auto","text-align":"center","width":"50%","padding":"10px"}
        }));

        $("#next").click(function() {
          display_element.html('');
          jsPsych.finishTrial(trial_data);
        });

      } else {
        // goto next trial in block
        display_element.html('');
        jsPsych.finishTrial(trial_data);
      }
    });

    var startTime = (new Date()).getTime();
  };

  return plugin;
})();
