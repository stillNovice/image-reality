var helper = require('./js/helper.js');

//jQuery variables
var $chooseSrcBtn, $chooseDestBtn, $submitBtn, $cardDiv, $workingDiv, $spinner, $rest, $nothingToShow, $imagesSection,
    $btnMove, $btnBack, $myModal;

var srcDir, destDir;

// defining functions.
var moveThis, reprocessPage, printImages, openModal;

$(document).ready(function() {

  // initialize jQuery variables
  $chooseSrcBtn = $('.btn-choose-src');
  $chooseDestBtn = $('.btn-choose-dest');
  $submitBtn = $('.btn-submit');
  $cardDiv = $('.card');
  $workingDiv = $('#workingDiv');
  $spinner = $('#mySpinner');
  $rest = $('#rest');
  $imagesSection = $('.imagesSection');
  $nothingToShow = $('.nothingToShow');
  $btnMove = $('.btn-Move');
  $btnBack = $('.btn-Back');
  $myModal = $('#myModal');
  $srcDir = $('#srcDir');
  $destDir = $('#destDir');

  //$chooseSrcBtn.on('click', selectDirectory('srcDir', 'Source'));
  //$chooseDestBtn.on('click', selectDirectory('destDir', 'Destination'));
  
  // Enter keypress should imitate 'Choose' button click.
  $srcDir.keypress(function(event) {
    if(event.keycode == 13 || event.which == 13) {
      $chooseSrcBtn.click();
      return;
    }
  });

  // Enter keypress should imitate 'Choose' button click.
  $destDir.keypress(function(event) {
    if(event.keycode == 13 || event.which == 13) {
      $chooseDestBtn.click();
      return;
    }
  });

  // binding function that opens dialog to select source directory.
  $chooseSrcBtn.on('click', function() {
    let title = "Select Source Folder";
    helper.dialog.showOpenDialog({
      title: title,
      properties: ["openDirectory"]
    }, (folderName) => {
      if(!folderName) {
        return console.error('undefined');
      }

      srcDir = folderName[0];
      $("#srcDir").val(srcDir);
      console.log('srcDir', srcDir);

      // Enabling Submit button only when the Directories chosen are valid.
      if(!(typeof srcDir == 'undefined' || typeof destDir == 'undefined')) {
        $submitBtn.attr('disabled', false);
      }
    });
  });

  // binding function that opens dialog to select destination directory.
  $chooseDestBtn.on('click', function() {
    let title = "Select Destination Folder";
    helper.dialog.showOpenDialog({
      title: title,
      properties: ["openDirectory"]
    }, (folderName) => {
      if(!folderName) {
        return console.error('undefined');
      }
      
      destDir = folderName[0];
      $("#destDir").val(destDir);
      console.log('destDir', destDir);

      // Enabling Submit button only when the Directories chosen are valid.
      if(!(typeof srcDir == 'undefined' || typeof destDir == 'undefined')) {
        $submitBtn.attr('disabled', false);
      }
    });
  });

  // Actions performed when SUBMIT button is clicked.
  $submitBtn.on('click', function(event) {
    console.log('Inside submitBtn');
    event.preventDefault();

    // turning spinner on
    $spinner.jmspinner('large');
    $rest.css('filter', 'blur(5px)');

    $cardDiv.hide();
    $workingDiv.show();

    // A promise that makes sure, helper function is run first and then 'printImages' function runs.
    var promise = Promise.resolve({
      "srcDir": srcDir,
      "destDir": destDir
    });

    promise.then(helper.renderSrcImages)
      .then(printImages);
    
  });

  // Actions performed when "DONE!" button is clicked.
  $btnBack.on('click', function(event) {
    event.preventDefault();
    $imagesSection.empty();
    $workingDiv.hide();
    $cardDiv.show();
  });

  // moves image if "Enter" key is pressed when Modal is focued.
  $myModal.keypress(function(event) {
    if(event.keycode == 13 || event.which == 13) {
      var $currImage = $('#thisImage');
      moveThis($currImage.data('filename'), $currImage.data('divid'));
      $myModal.modal('hide');
      return;
    }
  });

  // this function renders the images of the Source directory to the html page.
  printImages = function (imageData) {
    
    if(!(imageData && imageData.length)) {
      $imagesSection.hide();
      $nothingToShow.show();
  
      $rest.css('filter', '');
      $spinner.jmspinner(false);
  
      return;
    }
  
    var result = '<div class="row">';
    imageData.forEach(function(elem, idx) {
      if(idx && idx % 5 == 0) {
        result += '</div>';
        result += '<div class="row">';
      }
  
      // add image
      result += '<div class="col text-center" id="thisElem' + idx + '">';
      result += '<a href="#" onclick="openModal(event)" >';
      result += '<img class="img-thumbnail" style="height: 200px; width: 200px;" src="' + elem.path + '" data-divid="thisElem' + idx + '" data-filename="' + elem.name + '" />';
      result += '</a>';
  
      // add Move Button
      result += '<button type="button" class="btn btn-sm btn-primary btn-block btn-moveIt" onclick="moveThis(\'' + elem.name + '\', \'thisElem' + idx + '\')">Move It!</button>';
      result += '</div>';
    });
  
    $imagesSection.html(result);
  
    $nothingToShow.hide();
    $imagesSection.show();
  
    $rest.css('filter', '');
    $spinner.jmspinner(false);
  }

  // opening Modal on click of an image.
  openModal= function (event) {
    event.preventDefault();
    $spinner.jmspinner('large');

    $('#thisImage').attr('src', event.target.src);
    $('#thisImage').data('divid', event.target.dataset.divid);
    $('#thisImage').data('filename', event.target.dataset.filename);

    $myModal.modal('show');

    $spinner.jmspinner(false);

    return;
  }

  // this function moves an image to the Destination directory.
  moveThis = function (fileName, divId) {
    $spinner.jmspinner('large');
    $rest.css('filter', 'blur(5px)');
  
    console.log('client ---', srcDir, destDir, fileName);
    var promise = Promise.resolve({
      "srcDir": srcDir,
      "destDir": destDir,
      "fileName": fileName,
      "divId": divId
    });
  
    promise.then(helper.moveImagesToDest)
      .then(reprocessPage);
  }

  // after moving the image from Source to Destionation, this function reprocesses the html page and removes the image from the html page.
  reprocessPage = function(divId) {
    var $imgDiv = $('#' + divId);
    var $divParent = $imgDiv.parent();

    $imgDiv.remove();
    
    if($divParent.html() == '') {
      $divParent.remove();
    }

    $rest.css('filter', '');
    $spinner.jmspinner(false);

    if($.trim($imagesSection.html()) == '') {
      $nothingToShow.show();
      $imagesSection.hide();
    }
  }
});

