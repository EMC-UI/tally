/**
 * Created by cromed on 3/14/16.
 */
var request = require('superagent');
var pmongo = require('promised-mongo');
var _ = require('underscore');
var await = require('asyncawait/await');
var async = require('asyncawait/async');
var moment = require('moment');

var baseUrl = 'http://ucas-stash.lss.emc.com/rest/api/1.0';
var projectsUrl = baseUrl + '/projects';
var reposUrl = '/repos';
var commitsUrl = '/commits';

var PROJECTS_REPOS = {
    CSC: [
        'emc-mongo-store',
        'emc-server-base',
        'emc-server-common'
    ],
    CUC: [
        'emc-angular-login',
        'emc-angular-utils',
        'emc-css-charts',
        'emc-dashboard',
        'emc-dialog',
        'emc-login',
        'emc-notification',
        'emc-range-slider',
        'emc-rbac',
        'emc-settings',
        'emc-spork',
        'emc-ui',
        'emc-web-sockets',
        'generator-emc-webtier'
    ],
    SKUI: 'ALL'
};

var DEFAULT_SINCE_DAYS = 7;

var since;
var sinceTime = function (sinceDays) {
    sinceDays = sinceDays || DEFAULT_SINCE_DAYS;
    return moment().subtract(sinceDays, 'd').valueOf();
};

var getDbConnection = function () {
    return pmongo('mongodb://localhost:27017/tally');
};
var db = getDbConnection();

var createData = async(function (sinceDays) {
    since = sinceTime(sinceDays);

    var dropDbs = [
        db.collection('commits').drop(),
        db.collection('repos').drop(),
        db.collection('projects').drop()
    ];
    await(dropDbs);
    loadProjectsToMongo();
});

var loadCommitsForRepo = function (repo) {
    if (!repo || !repo.project || !repo.project.link) {
        throw new Error('repo is not an object: ', repo);
        return;
    }

    var repoCommitsUrl = baseUrl + repo.project.link.url + '/repos/' + repo.slug + commitsUrl + '?limit=100&withCounts=true';
    //console.log('repoCommitsUrl IS: ', repoCommitsUrl);

    request.get(repoCommitsUrl, function (err, res) {
        if (err) {
            //console.log('error no commits for: ', repoCommitsUrl);
            return;
        }

        var response = JSON.parse(res.text);
        //  values; []
        //  size: 25,
        //  isLastPage: false,
        //  start: 0,
        //  limit: 25,
        //  nextPageStart: 25,
        //  authorCount: 31,
        //  totalCount: 8792
        //console.log('response.counts limit=', response.limit, 'totalCount=', response.totalCount);

        var matchComments = _.filter(response.values, function (commit) {
            return commit.authorTimestamp >= since && commit.parents.length === 1;
        });
        //console.log('find matchComments', matchComments.length);
        if (matchComments.length > 0) {
            matchComments.forEach(function (commit) {
                commit.project = repo.project;
                commit.repo = repo.slug;
                db.collection('commits').insert(commit).then(function (message) {
                }).catch(function (err) {
                    console.log('commits error: ', err);
                });
            });
        }
    });
};

var loadReposForProject = function (project) {
    if (!project || !project.link) {
        console.log('error project is not an object: ', project);
        return;
    }
    var projectRepoUrl = baseUrl + project.link.url + reposUrl;
    //console.log('projectRepoUrl IS: ', projectRepoUrl);

    request.get(projectRepoUrl, function (err, res) {
        if (err) {
            console.log('Error repo', projectRepoUrl);
        }

        var response = JSON.parse(res.text);
        var repos = response.values;

        repos.forEach(function (repo) {
            if (PROJECTS_REPOS[project.key] === 'ALL' ||
                _.contains(PROJECTS_REPOS[project.key], repo.name)) {
                console.log('repo.name=', repo.name);
                db.collection('repos').insert(repo).then(function (repo) {
                    //console.log('find repos', repos.length);
                    loadCommitsForRepo(repo)
                }).catch(function (err) {
                    console.log('reposerror: ', err);
                });
            }
        });

    });
};

var loadProjectsToMongo = function () {
    console.log('projectsUrl is: ', projectsUrl);

    request.get(projectsUrl, function (err, res) {
        if (err) {
            console.log('Error project', projectsUrl);
        }
        var response = JSON.parse(res.text);
        var projects = response.values;

        projects.forEach(function (project) {
            if (PROJECTS_REPOS[project.key] !== undefined) {
                console.log('project.key=', project.key);
                db.collection('projects').insert(project).then(function (project) {
                    loadReposForProject(project);
                }).catch(function (err) {
                    console.log('projects error: ', err);
                });
            }
        });

    });
};

module.exports = {
    createData: createData
};

